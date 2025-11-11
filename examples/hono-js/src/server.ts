import 'dotenv/config'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { serve } from '@hono/node-server'
import { StripeSync, runMigrations } from 'stripe-sync-engine'

const requireEnv = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

const port = Number(process.env.PORT ?? 8787)
const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY')
const stripeWebhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET')
const databaseUrl = requireEnv('PG_DATABASE_URL')
const schema = process.env.PG_SCHEMA ?? 'stripe'
const maxConnections = process.env.PG_POOL_MAX ? Number(process.env.PG_POOL_MAX) : undefined

const stripeSync = new StripeSync({
  poolConfig: {
    connectionString: databaseUrl,
    max: maxConnections,
  },
  schema,
  stripeSecretKey,
  stripeWebhookSecret,
})

const app = new Hono()

app.get('/health', (c: Context) => c.json({ status: 'ok' }))

app.post('/migrations/run', async (c: Context) => {
  await runMigrations({ databaseUrl, schema })
  return c.json({ status: 'migrated' })
})

app.post('/sync/backfill', async (c: Context) => {
  const result = await stripeSync.syncBackfill({ object: 'all' })
  return c.json(result)
})

app.post('/sync/entity/:id', async (c: Context) => {
  const id = c.req.param('id')
  await stripeSync.syncSingleEntity(id)
  return c.json({ status: 'synced', id })
})

app.post('/webhooks/stripe', async (c: Context) => {
  const signature = c.req.header('stripe-signature') ?? undefined
  const arrayBuffer = await c.req.raw.arrayBuffer()
  const payload = Buffer.from(arrayBuffer)
  await stripeSync.processWebhook(payload, signature)
  return c.json({ received: true })
})

serve({
  port,
  fetch: app.fetch,
})

