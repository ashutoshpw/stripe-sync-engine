import pg, { PoolConfig, QueryResult } from "pg";
import { sql } from "drizzle-orm";
import { eq, inArray } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { createDrizzleClient } from "./drizzle-client";
import { getDrizzleTable } from "./drizzle-table-map";
import { getTableName as getTableNameUtil, normalizePrefix, TableName } from "./tableNames";

type PostgresConfig = {
  schema: string;
  poolConfig: PoolConfig;
  tablePrefix?: string;
};

export class PostgresClient {
  pool: pg.Pool;
  private tablePrefix: string;
  drizzle: ReturnType<typeof createDrizzleClient>;

  constructor(private config: PostgresConfig) {
    this.pool = new pg.Pool(config.poolConfig);
    this.tablePrefix = normalizePrefix(config.tablePrefix);
    this.drizzle = createDrizzleClient(this.pool);
  }

  /**
   * Returns the full table name with the configured prefix.
   * @param table - The base table name
   * @returns Full table name with prefix applied
   */
  getTableName(table: TableName): string {
    return getTableNameUtil(table, this.tablePrefix);
  }

  /**
   * Returns the configured schema name.
   */
  getSchema(): string {
    return this.config.schema;
  }

  async delete(table: TableName, id: string): Promise<boolean> {
    const tableName = this.getTableName(table);
    const schemaName = this.config.schema;
    const query = sql`
      DELETE FROM ${sql.identifier(schemaName)}.${sql.identifier(tableName)}
      WHERE id = ${id}
      RETURNING id
    `;
    const result = await this.drizzle.execute(query);
    return (result.rows?.length ?? 0) > 0;
  }

  async query(text: string, params?: string[]): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  async upsertMany<T extends Record<string, any>>(
    entries: T[],
    table: string,
    drizzleTable: PgTable
  ): Promise<T[]> {
    if (!entries.length) return [];

    const tableName = this.getTableName(table as TableName);
    const schemaName = this.config.schema;
    const schemaColumns = this.getTableColumns(drizzleTable);
    const chunkSize = 5;
    const results: T[] = [];

    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);

      const queries: Promise<T[]>[] = [];
      chunk.forEach((entry) => {
        const cleansed = this.cleanseArrayField(entry);
        const filtered: Record<string, any> = {};
        for (const [key, value] of Object.entries(cleansed)) {
          if (schemaColumns.has(key)) {
            filtered[key] = value;
          }
        }
        const columns = Object.keys(filtered);
        const columnNames = columns.map((col) => `"${col}"`).join(",");
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(",");
        const updateSet = columns.map((col) => `"${col}" = EXCLUDED."${col}"`).join(",");
        const values = columns.map((col) => filtered[col]);

        const queryText = `
          INSERT INTO "${schemaName}"."${tableName}" (
            ${columnNames}
          )
          VALUES (
            ${placeholders}
          )
          ON CONFLICT (id) DO UPDATE SET
            ${updateSet}
          RETURNING *
        `;

        queries.push(
          this.pool.query(queryText, values).then((result) => result.rows as T[])
        );
      });

      results.push(...(await Promise.all(queries)).flat());
    }

    return results;
  }

  private getTableColumns(drizzleTable: PgTable): Set<string> {
    const columns = new Set<string>();
    const tableObj = drizzleTable as Record<string, any>;
    
    if (tableObj._ && tableObj._.columns) {
      for (const col of Object.values(tableObj._.columns)) {
        if (col && typeof col === "object" && "name" in col && typeof col.name === "string") {
          columns.add(col.name);
        }
      }
    } else {
      for (const key in tableObj) {
        if (key.startsWith("_") || key === "getSQL") continue;
        
        const column = tableObj[key];
        if (!column || typeof column !== "object") continue;
        
        let columnName: string | undefined;
        
        if ("name" in column && typeof column.name === "string") {
          columnName = column.name;
        } else if ("column" in column && column.column && typeof column.column === "object" && "name" in column.column) {
          columnName = column.column.name;
        } else if ("dataType" in column) {
          const inner = (column as any).column || column;
          if (inner && "name" in inner && typeof inner.name === "string") {
            columnName = inner.name;
          }
        }
        
        if (columnName) {
          columns.add(columnName);
        }
      }
    }
    
    columns.add("last_synced_at");
    return columns;
  }

  private filterToSchemaColumns<T extends Record<string, any>>(
    entry: T,
    drizzleTable: PgTable
  ): Record<string, any> {
    const schemaColumns = this.getTableColumns(drizzleTable);
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(entry)) {
      if (schemaColumns.has(key)) {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  async upsertManyWithTimestampProtection<T extends Record<string, any>>(
    entries: T[],
    table: string,
    drizzleTable: PgTable,
    syncTimestamp?: string
  ): Promise<T[]> {
    const timestamp = syncTimestamp || new Date().toISOString();

    if (!entries.length) return [];

    const tableName = this.getTableName(table as TableName);
    const schemaName = this.config.schema;
    const schemaColumns = this.getTableColumns(drizzleTable);

    const chunkSize = 5;
    const results: T[] = [];

    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = entries.slice(i, i + chunkSize);

      const queries: Promise<T[]>[] = [];
      chunk.forEach((entry) => {
        const cleansed = this.cleanseArrayField(entry);
        const filtered: Record<string, any> = {};
        for (const [key, value] of Object.entries(cleansed)) {
          if (schemaColumns.has(key)) {
            filtered[key] = value;
          }
        }
        filtered.last_synced_at = timestamp;

        const columns = Object.keys(filtered);
        const columnNames = columns.map((col) => `"${col}"`).join(",");
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(",");
        const updateSet = columns
          .filter((col) => col !== "last_synced_at")
          .map((col) => `"${col}" = EXCLUDED."${col}"`)
          .join(",");

        const values = columns.map((col) => filtered[col]);
        const queryText = `
          INSERT INTO "${schemaName}"."${tableName}" (
            ${columnNames}
          )
          VALUES (
            ${placeholders}
          )
          ON CONFLICT (id) DO UPDATE SET
            ${updateSet},
            "last_synced_at" = $${columns.length}::timestamptz
          WHERE "${schemaName}"."${tableName}"."last_synced_at" IS NULL 
             OR "${schemaName}"."${tableName}"."last_synced_at" < $${columns.length}::timestamptz
          RETURNING *
        `;

        queries.push(
          this.pool.query(queryText, values).then((result) => result.rows as T[])
        );
      });

      results.push(...(await Promise.all(queries)).flat());
    }

    return results;
  }

  async findMissingEntries(table: string, ids: string[]): Promise<string[]> {
    if (!ids.length) return [];

    const tableName = this.getTableName(table as TableName);
    const schemaName = this.config.schema;
    const query = sql`
      SELECT id FROM ${sql.identifier(schemaName)}.${sql.identifier(tableName)}
      WHERE id = ANY(${ids}::text[])
    `;
    const result = await this.drizzle.execute(query);
    const existingIds = (result.rows ?? []).map((it: any) => it.id);
    const missingIds = ids.filter((it) => !existingIds.includes(it));

    return missingIds;
  }


  /**
   * For array object field like invoice.custom_fields
   * ex: [{"name":"Project name","value":"Test Project"}]
   *
   * we need to stringify it first cos passing array object directly will end up with
   * {
   * invalid input syntax for type json
   * detail: 'Expected ":", but found "}".',
   * where: 'JSON data, line 1: ...\\":\\"Project name\\",\\"value\\":\\"Test Project\\"}"}',
   * }
   */

  private cleanseArrayField(obj: Record<string, unknown>): Record<string, unknown> {
    const cleansed = { ...obj };
    for (const key of Object.keys(cleansed)) {
      const data = cleansed[key];
      if (Array.isArray(data)) {
        cleansed[key] = JSON.stringify(data);
      }
    }
    return cleansed;
  }
}
