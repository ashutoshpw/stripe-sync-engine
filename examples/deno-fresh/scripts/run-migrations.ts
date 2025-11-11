import { runMigrations } from "stripe-sync-engine"

const databaseUrl = Deno.env.get("PG_DATABASE_URL")

if (!databaseUrl) {
  console.error("PG_DATABASE_URL is required")
  Deno.exit(1)
}

const schema = Deno.env.get("PG_SCHEMA") ?? "stripe"

try {
  await runMigrations({ databaseUrl, schema })
  console.log("Migrations completed")
} catch (error) {
  console.error("Migration failed:", error)
  Deno.exit(1)
}


