# Cloudflare Worker Stripe Webhook Example

This Cloudflare Worker shows how to verify Stripe webhooks with [Hono](https://hono.dev/) inside the Workers runtime. Cloudflare Workers do not provide Node.js APIs such as TCP sockets, so the `stripe-sync-engine` package cannot run here directly. Instead, this example focuses on authenticating Stripe webhooks and optionally forwarding them to a service that can execute the full sync against PostgreSQL.

## Requirements

- Node.js 18+
- `pnpm`
- Cloudflare account with the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Stripe account with API keys

## Setup

1. Install dependencies from the repository root so the workspace links resolve:

   ```sh
   pnpm install
   ```

2. Copy the environment template and populate the required secrets:

   ```sh
   cd packages/sync-engine/examples/cloudflare-worker
   cp .dev.vars.example .dev.vars
   ```

   Required values:

   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

   Optional values:

   - `FORWARD_SYNC_URL` – HTTPS endpoint that can run `stripe-sync-engine` (for example, a Node.js server or a queue ingestion API).

## Run Locally

```sh
pnpm dev
```

Wrangler hosts the Worker at `http://localhost:8787`.

Send Stripe events to your local Worker with the Stripe CLI:

```sh
stripe listen --forward-to http://localhost:8787/webhooks/stripe
```

The CLI will output a webhook signing secret that must match `STRIPE_WEBHOOK_SECRET`.

## Deploy

Authenticate Wrangler if you have not already:

```sh
wrangler login
```

Publish the Worker:

```sh
pnpm deploy
```

Set production secrets with Wrangler:

```sh
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put FORWARD_SYNC_URL
```

## Handling Database Sync

Because Workers cannot open native PostgreSQL connections, choose one of these approaches to integrate `stripe-sync-engine`:

- **Forward webhooks** – Point `FORWARD_SYNC_URL` to a backend (Fastify, Next.js API route, etc.) running on Node.js that calls `stripe-sync-engine` for backfill and entity sync.
- **Use HTTP database APIs** – If your Postgres provider exposes an HTTP interface (Supabase REST, PostgREST, Hasura), adapt the Worker to call that API with the parsed event payload.
- **Queue and process elsewhere** – Enqueue webhook events (for example, Cloudflare Queues, Workers KV) and process them with a separate worker or service that has network access to Postgres.

Database migrations must also be triggered outside of Workers (e.g., using the `run-migrations.ts` script from the Hono example or another server-side process).

## Endpoints

- `GET /health` – Returns `{ status: "ok" }` for monitoring.
- `POST /webhooks/stripe` – Verifies Stripe signatures and optionally forwards events.

