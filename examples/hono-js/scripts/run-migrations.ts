import 'dotenv/config'
import { runMigrations } from 'stripe-sync-engine'

const databaseUrl = process.env.PG_DATABASE_URL

if (!databaseUrl) {
  console.error('PG_DATABASE_URL is required')
  process.exit(1)
}

await runMigrations({
  databaseUrl,
  schema: process.env.PG_SCHEMA ?? 'stripe',
})

console.log('Migrations completed')

