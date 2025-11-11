import { StripeSync } from "stripe-sync-engine"

const requireEnv = (key: string): string => {
  const value = Deno.env.get(key)
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY")
const stripeWebhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET")
const databaseUrl = requireEnv("PG_DATABASE_URL")
const schema = Deno.env.get("PG_SCHEMA") ?? "stripe"
const maxConnections = Deno.env.get("PG_POOL_MAX")
  ? Number(Deno.env.get("PG_POOL_MAX"))
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


