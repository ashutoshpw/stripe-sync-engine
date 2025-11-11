import 'dotenv/config'
import { runMigrations } from 'stripe-sync-engine'

const databaseUrl = process.env.PG_DATABASE_URL

if (!databaseUrl) {
  console.error('PG_DATABASE_URL is required')
  process.exit(1)
}

const schema = process.env.PG_SCHEMA ?? 'stripe'

try {
  await runMigrations({ databaseUrl, schema })
  console.log('Migrations completed')
} catch (error) {
  console.error('Migration failed:', error)
  process.exit(1)
}

