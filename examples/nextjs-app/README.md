# Next.js App Router Stripe Sync Example

This example demonstrates how to use `stripe-sync-engine` with the [Next.js App Router](https://nextjs.org/docs/app). The App Router uses Route Handlers (`route.ts` files) to create API endpoints, replacing the traditional `pages/api` approach used in the Pages Router.

## Prerequisites

- Node.js 18 or newer
- Stripe account with API keys
- PostgreSQL database accessible from your machine

## Next.js App Router Overview

The App Router introduces a new routing system based on the `app` directory:

- **Route Handlers**: API endpoints are created using `route.ts` files that export HTTP method functions (GET, POST, etc.)
- **Dynamic Routes**: Use `[id]` folder names for dynamic segments
- **Server Components**: Route handlers run on the server by default
- **Type Safety**: Full TypeScript support with proper types for requests and responses

## Setup

1. **Copy the environment template:**

   ```sh
   cp env.example .env.local
   ```

   Next.js automatically loads `.env.local` files. You can also use `.env` for development.

2. **Configure environment variables:**

   Edit `.env.local` and set the required values:

   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret
   - `PG_DATABASE_URL` - PostgreSQL connection string

   Optional variables:

   - `PG_SCHEMA` - Database schema name (defaults to `stripe`)
   - `PG_POOL_MAX` - Maximum number of database connections

3. **Install dependencies:**

   From the repository root, install dependencies so the local `stripe-sync-engine` package is linked:

   ```sh
   pnpm install
   ```

## Database Migrations

Run migrations using the provided script:

```sh
pnpm migrate
```

Or manually:

```sh
tsx scripts/run-migrations.ts
```

This will create the `stripe` schema and all necessary tables in your PostgreSQL database.

## Running the Development Server

Start the Next.js development server:

```sh
pnpm dev
```

The server will start at `http://localhost:3000` by default.

## API Endpoints

All API endpoints are located in the `app/api/` directory using Route Handlers:

### Health Check

```sh
curl http://localhost:3000/api/health
```

Returns: `{"status":"ok"}`

**Route Handler:** `app/api/health/route.ts`

### Run Migrations

```sh
curl -X POST http://localhost:3000/api/migrations/run
```

Executes database migrations on demand.

**Route Handler:** `app/api/migrations/run/route.ts`

### Sync Backfill

```sh
curl -X POST http://localhost:3000/api/sync/backfill
```

Performs a full backfill sync of all Stripe objects (`object: 'all'`).

**Route Handler:** `app/api/sync/backfill/route.ts`

### Sync Single Entity

```sh
curl -X POST http://localhost:3000/api/sync/entity/cus_12345
```

Syncs a single Stripe entity by its ID. The entity type is detected automatically based on the ID prefix.

**Route Handler:** `app/api/sync/entity/[id]/route.ts`

### Stripe Webhooks

```sh
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: ..." \
  -d @webhook-payload.json
```

Accepts Stripe webhook events and processes them using `stripe-sync-engine`.

**Route Handler:** `app/api/webhooks/stripe/route.ts`

## Testing Webhooks Locally

Use the Stripe CLI to forward webhook events to your local server:

```sh
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The Stripe CLI will provide a webhook signing secret—use that for `STRIPE_WEBHOOK_SECRET` in your `.env.local` file.

## Route Handler Conventions

### Basic Route Handler

Route Handlers export async functions named after HTTP methods:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
```

### Dynamic Routes

Dynamic routes use `[id]` folder names. Access parameters via the `params` prop (async in Next.js 15+):

```typescript
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Use id...
}
```

### Request Handling

Route Handlers receive a `Request` object and return a `NextResponse`:

```typescript
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  const body = await request.arrayBuffer()
  // Process request...
  return NextResponse.json({ received: true })
}
```

## Deployment

### Vercel

Next.js applications deploy seamlessly to [Vercel](https://vercel.com):

1. **Push to GitHub:** Commit your code to a GitHub repository

2. **Import Project:** In the Vercel dashboard, import your repository

3. **Configure Environment Variables:** Add your environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PG_DATABASE_URL`
   - `PG_SCHEMA` (optional)
   - `PG_POOL_MAX` (optional)

4. **Deploy:** Vercel will automatically build and deploy your application

### Self-Hosted

For self-hosted deployments:

1. **Build the application:**

   ```sh
   pnpm build
   ```

2. **Start the production server:**

   ```sh
   pnpm start
   ```

3. **Set environment variables** in your hosting environment

4. **Run migrations** before starting the server (use the migration script or API endpoint)

## Route Segment Configuration

You can configure route behavior using exports in your route files:

```typescript
export const dynamic = 'force-dynamic' // Disable caching
export const maxDuration = 30 // Set max execution time (seconds)
```

## Notes

- Route Handlers are Server Components and run only on the server
- Environment variables are accessed via `process.env`
- Next.js automatically handles TypeScript types for Route Handlers
- Dynamic route parameters are async in Next.js 15+ (use `await params`)
- The `stripe-sync-engine` library is imported from the local workspace package

## Troubleshooting

- **Import errors:** Ensure `tsconfig.json` has the correct path aliases configured
- **Database connection:** Verify `PG_DATABASE_URL` is correct and the database is accessible
- **Webhook signature verification:** Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or dashboard
- **Environment variables:** Next.js only loads `.env.local` and `.env` files—ensure variables are set correctly

