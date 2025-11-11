# Hono Stripe Sync Example

This example shows how to run the `stripe-sync-engine` package inside a simple [Hono](https://hono.dev/) Node.js server. It wires Stripe webhooks, manual sync endpoints, and a migration helper to keep a PostgreSQL database up to date.

## Prerequisites

- Node.js 18 or newer
- Stripe account with API keys
- PostgreSQL database reachable from this machine

## Setup

1. Copy the environment template:

   ```sh
   cp env.example .env
   ```

2. Fill in the required values:

   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PG_DATABASE_URL`

   Optional values:

   - `PORT` (default `8787`)
   - `PG_SCHEMA` (defaults to `stripe` inside the library)
   - `PG_POOL_MAX`

3. Install dependencies from the repository root so the local `stripe-sync-engine` package is linked:

   ```sh
   pnpm install
   ```

## Database Migrations

Run the example migrations helper after configuring `.env`:

```sh
pnpm --filter stripe-sync-engine-hono-example migrate
```

This calls `runMigrations` from the library against your `PG_DATABASE_URL`.

## Start the Server

```sh
pnpm --filter stripe-sync-engine-hono-example dev
```

The server listens on `http://localhost:8787` by default.

Endpoints:

- `GET /health` – readiness probe.
- `POST /migrations/run` – executes migrations on demand.
- `POST /sync/backfill` – performs a full backfill (`object: 'all'`).
- `POST /sync/entity/:id` – re-syncs a single Stripe entity by ID.
- `POST /webhooks/stripe` – accepts Stripe webhook payloads with signature header.

## Triggering a Backfill

```sh
curl -X POST http://localhost:8787/sync/backfill
```

## Testing Webhooks Locally

Use the Stripe CLI to forward events:

```sh
stripe listen --forward-to localhost:8787/webhooks/stripe
```

When forwarding, Stripe CLI provides a webhook signing secret—use that for `STRIPE_WEBHOOK_SECRET`.

## Clean Up

Stop the Node process and remove the `.env` file when finished. No additional teardown is required.

