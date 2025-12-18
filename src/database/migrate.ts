import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ConnectionOptions } from "node:tls";
import { Client } from "pg";
import { migrate } from "pg-node-migrations";
import pino from "pino";
import { BASE_TABLE_NAMES, normalizePrefix } from "./tableNames";

const DEFAULT_MIGRATION_TABLE_NAME = "stripe_migrations";

type MigrationConfig = {
  schema: string;
  databaseUrl: string;
  ssl?: ConnectionOptions;
  logger?: pino.Logger;
  /**
   * Optional prefix for all table names.
   * An underscore is auto-appended if not present.
   * Example: 'billing' results in 'billing_products', 'billing_customers', etc.
   * Default: '' (no prefix)
   */
  tablePrefix?: string;
  /**
   * Name of the table used to track migrations.
   * Default: 'stripe_migrations'
   */
  migrationTableName?: string;
};

/**
 * Processes migration SQL by replacing schema and table names.
 *
 * @param sql - The raw SQL from migration file
 * @param schema - Target schema name
 * @param tablePrefix - Optional table prefix (normalized)
 * @returns Processed SQL with replaced schema and table names
 */
function processMigrationSql(sql: string, schema: string, tablePrefix: string): string {
  let processed = sql;

  // Replace schema references (both quoted and unquoted patterns)
  // Pattern: "stripe". or stripe.
  processed = processed.replace(/"stripe"\./g, `"${schema}".`);
  processed = processed.replace(/stripe\./g, `${schema}.`);

  // Replace table names - must be done carefully to avoid partial matches
  // We need to replace table names that appear after the schema prefix
  // Sort by length descending to replace longer names first (avoid partial matches)
  const tableNames = Object.values(BASE_TABLE_NAMES).sort((a, b) => b.length - a.length);

  for (const baseName of tableNames) {
    const prefixedName = `${tablePrefix}${baseName}`;

    // Replace "schema"."table_name" patterns
    // Use word boundaries to avoid partial matches
    const quotedPattern = new RegExp(`"${schema}"\\."${baseName}"`, "g");
    processed = processed.replace(quotedPattern, `"${schema}"."${prefixedName}"`);

    // Replace schema.table_name patterns (unquoted)
    const unquotedPattern = new RegExp(`${schema}\\.${baseName}([^_a-z])`, "g");
    processed = processed.replace(unquotedPattern, `${schema}.${prefixedName}$1`);

    // Handle end of line case
    const eolPattern = new RegExp(`${schema}\\.${baseName}$`, "gm");
    processed = processed.replace(eolPattern, `${schema}.${prefixedName}`);
  }

  return processed;
}

async function connectAndMigrate(
  client: Client,
  migrationsDirectory: string,
  config: MigrationConfig,
  logOnError = false
) {
  if (!fs.existsSync(migrationsDirectory)) {
    config.logger?.info(`Migrations directory ${migrationsDirectory} not found, skipping`);
    return;
  }

  const normalizedPrefix = normalizePrefix(config.tablePrefix);
  const needsProcessing = config.schema !== "stripe" || normalizedPrefix !== "";

  let effectiveMigrationsDir = migrationsDirectory;

  // If we need to process SQL files, create a temp directory with processed files
  if (needsProcessing) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "stripe-sync-migrations-"));
    effectiveMigrationsDir = tempDir;

    const files = fs.readdirSync(migrationsDirectory).filter((f) => f.endsWith(".sql"));

    for (const file of files) {
      const originalSql = fs.readFileSync(path.join(migrationsDirectory, file), "utf-8");
      const processedSql = processMigrationSql(originalSql, config.schema, normalizedPrefix);
      fs.writeFileSync(path.join(tempDir, file), processedSql);
    }

    config.logger?.info(
      { schema: config.schema, tablePrefix: normalizedPrefix || "(none)" },
      "Processed migration files for custom schema/prefix"
    );
  }

  const optionalConfig = {
    schemaName: config.schema,
    tableName: config.migrationTableName ?? DEFAULT_MIGRATION_TABLE_NAME,
  };

  try {
    await migrate({ client }, effectiveMigrationsDir, optionalConfig);
  } catch (error) {
    if (logOnError && error instanceof Error) {
      config.logger?.error(error, "Migration error:");
    } else {
      throw error;
    }
  } finally {
    // Clean up temp directory if we created one
    if (needsProcessing && effectiveMigrationsDir !== migrationsDirectory) {
      try {
        fs.rmSync(effectiveMigrationsDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

export async function runMigrations(config: MigrationConfig): Promise<void> {
  // Init DB
  const client = new Client({
    connectionString: config.databaseUrl,
    ssl: config.ssl,
    connectionTimeoutMillis: 10_000,
  });

  try {
    // Run migrations
    await client.connect();

    // Ensure schema exists, not doing it via migration to not break current migration checksums
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${config.schema};`);

    config.logger?.info("Running migrations");

    await connectAndMigrate(client, path.resolve(__dirname, "./migrations"), config);
  } catch (err) {
    config.logger?.error(err, "Error running migrations");
  } finally {
    await client.end();
    config.logger?.info("Finished migrations");
  }
}
