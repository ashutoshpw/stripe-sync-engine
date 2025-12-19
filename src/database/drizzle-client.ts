import { drizzle } from "drizzle-orm/node-postgres"
import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import type { Pool } from "pg"
import * as schema from "../drizzle-schema"

export function createDrizzleClient(pool: Pool): NodePgDatabase<typeof schema> {
  return drizzle(pool, { schema })
}

