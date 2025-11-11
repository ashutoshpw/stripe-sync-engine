import { StripeSync } from 'stripe-sync-engine'

const requireEnv = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY')
const stripeWebhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET')
const databaseUrl = requireEnv('PG_DATABASE_URL')
const schema = process.env.PG_SCHEMA ?? 'stripe'
const maxConnections = process.env.PG_POOL_MAX
  ? Number(process.env.PG_POOL_MAX)
  : undefined

export const stripeSync = new StripeSync({
  poolConfig: {
    connectionString: databaseUrl,
    max: maxConnections,
  },
  schema,
  stripeSecretKey,
  stripeWebhookSecret,
})

export { databaseUrl, schema }

