import { Hono } from 'hono'
import type { Context } from 'hono'
import Stripe from 'stripe'

type Bindings = {
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  FORWARD_SYNC_URL?: string
}

const createStripe = (env: Bindings) =>
  new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  })

const app = new Hono<{ Bindings: Bindings }>()

app.get('/health', (c: Context<{ Bindings: Bindings }>) => c.json({ status: 'ok' }))

app.post('/webhooks/stripe', async (c: Context<{ Bindings: Bindings }>) => {
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FORWARD_SYNC_URL } = c.env

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return c.json({ error: 'Stripe environment variables are not configured' }, 500)
  }

  const stripe = createStripe(c.env)
  const payload = await c.req.text()
  const signature = c.req.header('stripe-signature')

  if (!signature) {
    return c.json({ error: 'Missing stripe-signature header' }, 400)
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Stripe signature verification failed', message)
    return c.json({ error: 'Invalid Stripe signature' }, 400)
  }

  try {
    if (FORWARD_SYNC_URL) {
      await fetch(FORWARD_SYNC_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'stripe-event-id': event.id,
        },
        body: JSON.stringify(event),
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Forwarding webhook failed', message)
    return c.json({ error: 'Failed to forward webhook' }, 502)
  }

  return c.json({ received: true })
})

export default app

