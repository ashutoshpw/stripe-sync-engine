# Deno Fresh Stripe Sync Example

This example demonstrates how to use `stripe-sync-engine` with the [Deno Fresh](https://fresh.deno.dev/) framework. Fresh is a full-stack web framework for Deno that uses file-based routing and supports server-side rendering with selective client-side interactivity.

## Prerequisites

- [Deno](https://deno.com/) 1.40 or newer installed
- Stripe account with API keys
- PostgreSQL database accessible from your machine

## Project Structure

Fresh uses file-based routing where files in the `routes/` directory automatically become endpoints:

- `routes/api/health.ts` → `GET /api/health`
- `routes/api/migrations/run.ts` → `POST /api/migrations/run`
- `routes/api/sync/backfill.ts` → `POST /api/sync/backfill`
- `routes/api/sync/entity/[id].ts` → `POST /api/sync/entity/:id`
- `routes/api/webhooks/stripe.ts` → `POST /api/webhooks/stripe`

## Setup

1. **Copy the environment template:**

   ```sh
   cp env.example .env
   ```

2. **Configure environment variables:**

   Edit `.env` and set the required values:

   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret
   - `PG_DATABASE_URL` - PostgreSQL connection string

   Optional variables:

   - `PG_SCHEMA` - Database schema name (defaults to `stripe`)
   - `PG_POOL_MAX` - Maximum number of database connections

3. **Load environment variables:**

   Deno doesn't automatically load `.env` files. You can use a tool like `deno-dotenv` or set environment variables manually:

   ```sh
   export STRIPE_SECRET_KEY="sk_test_..."
   export STRIPE_WEBHOOK_SECRET="whsec_..."
   export PG_DATABASE_URL="postgres://..."
   ```

   Or use a `.env` loader in your code (not included in this example for simplicity).

## Database Migrations

Run migrations using the provided script:

```sh
deno task migrate
```

Or manually:

```sh
deno run --allow-env --allow-net scripts/run-migrations.ts
```

This will create the `stripe` schema and all necessary tables in your PostgreSQL database.

## Running the Development Server

Start the Fresh development server:

```sh
deno task dev
```

The server will start at `http://localhost:8000` by default.

## API Endpoints

### Health Check

```sh
curl http://localhost:8000/api/health
```

Returns: `{"status":"ok"}`

### Run Migrations

```sh
curl -X POST http://localhost:8000/api/migrations/run
```

Executes database migrations on demand.

### Sync Backfill

```sh
curl -X POST http://localhost:8000/api/sync/backfill
```

Performs a full backfill sync of all Stripe objects (`object: 'all'`).

### Sync Single Entity

```sh
curl -X POST http://localhost:8000/api/sync/entity/cus_12345
```

Syncs a single Stripe entity by its ID. The entity type is detected automatically based on the ID prefix.

### Stripe Webhooks

```sh
curl -X POST http://localhost:8000/api/webhooks/stripe \
  -H "stripe-signature: ..." \
  -d @webhook-payload.json
```

Accepts Stripe webhook events and processes them using `stripe-sync-engine`.

## Testing Webhooks Locally

Use the Stripe CLI to forward webhook events to your local server:

```sh
stripe listen --forward-to localhost:8000/api/webhooks/stripe
```

The Stripe CLI will provide a webhook signing secret—use that for `STRIPE_WEBHOOK_SECRET` in your `.env` file.

## Deployment

### Deno Deploy

Fresh applications can be deployed to [Deno Deploy](https://deno.com/deploy):

1. **Push to GitHub:** Commit your code to a GitHub repository

2. **Create a project:** In the Deno Deploy dashboard, create a new project and link your repository

3. **Set environment variables:** Add your environment variables in the project settings:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PG_DATABASE_URL`
   - `PG_SCHEMA` (optional)
   - `PG_POOL_MAX` (optional)

4. **Deploy:** Deno Deploy will automatically deploy your application

### Other Platforms

Fresh can run on any platform that supports Deno. Ensure:

- Environment variables are configured
- Database migrations are run before starting the server
- Your PostgreSQL database is accessible from the deployment environment

## npm Specifiers

This example uses npm specifiers to import `stripe-sync-engine`:

```typescript
import { StripeSync } from "stripe-sync-engine"
```

Deno resolves this via the `deno.json` imports configuration. The library uses Node.js `pg` under the hood, which should work in Deno via npm compatibility, but be aware of potential compatibility considerations.

## Notes

- Fresh uses file-based routing—files in `routes/` automatically become endpoints
- API routes export a `handler` object with HTTP method handlers (`GET`, `POST`, etc.)
- Environment variables are accessed via `Deno.env.get()`
- The `stripe-sync-engine` library is imported using npm specifiers as documented in the main README

## Troubleshooting

- **Import errors:** Ensure `deno.json` has the correct import mappings
- **Database connection:** Verify `PG_DATABASE_URL` is correct and the database is accessible
- **Webhook signature verification:** Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or dashboard
- **npm package compatibility:** If you encounter issues with npm packages, check Deno's npm compatibility documentation


