# Stripe Sync Engine Integration Guide

This guide will help you integrate [stripe-sync-engine](https://github.com/ashutoshpw/stripe-sync-engine) into your Next.js application. The stripe-sync-engine automatically synchronizes Stripe data (customers, invoices, products, subscriptions, etc.) into your PostgreSQL database, enabling you to query and analyze Stripe data directly from your database.

## 📋 Prerequisites

- Next.js application (App Router or Pages Router)
- PostgreSQL database
- Stripe account with API keys
- Node.js 18+ installed

## 🚀 Installation

### Step 1: Install Dependencies

Install the required packages using your preferred package manager:

```bash
# Using npm
npm install stripe-sync-engine@github:ashutoshpw/stripe-sync-engine pg @types/pg

# Using yarn
yarn add stripe-sync-engine@github:ashutoshpw/stripe-sync-engine pg @types/pg

# Using pnpm
pnpm add stripe-sync-engine@github:ashutoshpw/stripe-sync-engine pg @types/pg

# Using bun
bun add stripe-sync-engine@github:ashutoshpw/stripe-sync-engine pg @types/pg
```

**Note:** `stripe-sync-engine` uses `pg` (node-postgres) for connection pooling. This can coexist with other PostgreSQL clients you may already be using.

### Step 2: Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Required: PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# Required: Stripe API keys
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # Get this from Stripe Dashboard > Webhooks

# Optional: Stripe API version (defaults to 2020-08-27)
STRIPE_API_VERSION=2023-10-16
```

## 📁 Project Structure Setup

### Step 3: Create Stripe Sync Utility

Create a utility file to initialize and manage the StripeSync instance. The location depends on your project structure:

**For App Router projects:**
- Create: `lib/stripe-sync.ts` or `src/lib/stripe-sync.ts`

**For Pages Router projects:**
- Create: `lib/stripe-sync.ts` or `utils/stripe-sync.ts`

```typescript
import { StripeSync } from "stripe-sync-engine";

let stripeSyncInstance: StripeSync | null = null;

export function getStripeSync(): StripeSync {
  if (!stripeSyncInstance) {
    // Validate required environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    }

    // Initialize StripeSync instance
    stripeSyncInstance = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL,
        max: 10, // Maximum number of connections in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
      },
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      stripeApiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
      schema: "stripe", // Database schema name (default: "stripe")
      autoExpandLists: true, // Fetch all list items from Stripe (not just default 10)
      backfillRelatedEntities: true, // Ensure related entities are present for foreign key integrity
    });
  }

  return stripeSyncInstance;
}
```

### Step 4: Run Database Migrations

Create a migration script to set up the Stripe schema in your database:

**Create:** `scripts/run-stripe-migrations.ts` (or `.js` if not using TypeScript)

```typescript
import { runMigrations } from "stripe-sync-engine";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔄 Running Stripe sync engine migrations...");
  
  await runMigrations({
    databaseUrl: process.env.DATABASE_URL,
  });

  console.log("✅ Stripe migrations completed successfully");
}

main().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
```

**Add script to `package.json`:**

```json
{
  "scripts": {
    "stripe:migrate": "tsx scripts/run-stripe-migrations.ts"
    // Or if using ts-node: "stripe:migrate": "ts-node scripts/run-stripe-migrations.ts"
    // Or if using bun: "stripe:migrate": "bun run scripts/run-stripe-migrations.ts"
  }
}
```

**Install tsx if needed:**
```bash
npm install -D tsx
# or
yarn add -D tsx
# or
pnpm add -D tsx
```

**Run migrations:**
```bash
npm run stripe:migrate
```

This creates a `stripe` schema in your PostgreSQL database with tables for all Stripe objects.

## 🔗 Webhook Integration

### Step 5: Update Stripe Webhook Handler

Update your existing Stripe webhook handler to use stripe-sync-engine. The location depends on your Next.js setup:

**For App Router:**
- Update: `app/api/webhooks/stripe/route.ts` (or your existing webhook route)

**For Pages Router:**
- Update: `pages/api/webhooks/stripe.ts` (or your existing webhook route)

```typescript
import { getStripeSync } from "@/lib/stripe-sync"; // Adjust import path as needed
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe client (if not already done)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
});

// For App Router
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    // Process webhook with stripe-sync-engine
    const stripeSync = getStripeSync();
    await stripeSync.processWebhook(payload, sig);

    // Optionally verify the event with Stripe SDK
    const event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    console.log("✅ Stripe event synced:", event.type);

    // Add your custom business logic here
    // The data is already synced to the database by stripe-sync-engine

    return NextResponse.json({
      status: "success",
      eventType: event.type,
    });
  } catch (error: any) {
    console.error("❌ Webhook processing failed:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: error.message 
      },
      { status: 400 }
    );
  }
}

// For Pages Router, use this instead:
/*
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body;
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  try {
    const stripeSync = getStripeSync();
    await stripeSync.processWebhook(JSON.stringify(payload), sig);

    const event = stripe.webhooks.constructEvent(
      JSON.stringify(payload),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    console.log("✅ Stripe event synced:", event.type);

    return res.status(200).json({
      status: "success",
      eventType: event.type,
    });
  } catch (error: any) {
    console.error("❌ Webhook processing failed:", error);
    return res.status(400).json({
      status: "error",
      error: error.message,
    });
  }
}
*/
```

### Step 6: Configure Stripe Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL:
   - Development: `http://localhost:3000/api/webhooks/stripe` (or your route)
   - Production: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to (or select "All events")
5. Copy the **Signing secret** (starts with `whsec_`) and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## 📊 Querying Synced Data

Once data is synced, you can query it directly from your database. The stripe-sync-engine creates a `stripe` schema with tables for all Stripe objects.

### Using Raw SQL Queries

```typescript
// Example: Get all customers
import { db } from "@/lib/db"; // Your database client
import { sql } from "drizzle-orm"; // or use your ORM's SQL function

const customers = await db.execute(
  sql`SELECT * FROM stripe.customers ORDER BY created DESC LIMIT 10`
);

// Example: Get invoices for a specific customer
const invoices = await db.execute(
  sql`SELECT * FROM stripe.invoices WHERE customer_id = $1 ORDER BY created DESC`,
  ["cus_1234567890"]
);

// Example: Get subscription details
const subscriptions = await db.execute(
  sql`SELECT * FROM stripe.subscriptions WHERE status = 'active'`
);
```

### Using Your ORM

If you're using Drizzle ORM, Prisma, or another ORM, you can query the `stripe` schema tables directly:

```typescript
// Example with Drizzle ORM
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Get recent payments
const payments = await db.execute(
  sql`SELECT * FROM stripe.payment_intents WHERE status = 'succeeded' ORDER BY created DESC LIMIT 20`
);
```

## 🔄 Backfilling Historical Data

To sync historical Stripe data, create a backfill script:

**Create:** `scripts/backfill-stripe.ts`

```typescript
import { getStripeSync } from "@/lib/stripe-sync";

async function main() {
  const stripeSync = getStripeSync();

  // Get start date from command line argument or use a default
  const startDateArg = process.argv[2];
  
  if (!startDateArg) {
    console.error("Usage: npm run stripe:backfill <start-date-unix-timestamp>");
    console.error("Example: npm run stripe:backfill 1643872333");
    console.error("Or use a date: npm run stripe:backfill $(date -d '2024-01-01' +%s)");
    process.exit(1);
  }

  const timestamp = parseInt(startDateArg, 10);
  if (isNaN(timestamp)) {
    console.error("Invalid timestamp. Please provide a Unix timestamp.");
    process.exit(1);
  }

  const startDate = new Date(timestamp * 1000);
  console.log(`🔄 Backfilling Stripe data from ${startDate.toISOString()}...`);

  try {
    // Backfill all object types
    await stripeSync.syncBackfill({
      object: "all", // or specific: "customer", "invoice", "product", etc.
      created: { gte: timestamp },
    });

    console.log("✅ Backfill completed successfully");
  } catch (error) {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  }
}

main();
```

**Add script to `package.json`:**

```json
{
  "scripts": {
    "stripe:backfill": "tsx scripts/backfill-stripe.ts"
  }
}
```

**Run backfill:**
```bash
# Backfill from a specific Unix timestamp
npm run stripe:backfill 1643872333

# Or backfill from a specific date (Unix/Linux/Mac)
npm run stripe:backfill $(date -d '2024-01-01' +%s)
```

**Note:** For large Stripe accounts (10,000+ objects), backfill in smaller date ranges to avoid timeouts:

```typescript
// Example: Backfill day by day
const startDate = new Date("2024-01-01");
const endDate = new Date("2024-12-31");

for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
  const dayStart = Math.floor(date.getTime() / 1000);
  const dayEnd = Math.floor((date.getTime() + 86400000) / 1000) - 1;
  
  await stripeSync.syncBackfill({
    object: "all",
    created: { gte: dayStart, lte: dayEnd },
  });
  
  console.log(`✅ Synced ${date.toISOString().split('T')[0]}`);
}
```

## 🔧 Advanced Configuration

### Sync Single Entity

To sync or update a single Stripe entity:

```typescript
import { getStripeSync } from "@/lib/stripe-sync";

const stripeSync = getStripeSync();

// Sync a customer by ID
await stripeSync.syncSingleEntity("cus_1234567890");

// Sync a product
await stripeSync.syncSingleEntity("prod_1234567890");

// Sync an invoice
await stripeSync.syncSingleEntity("in_1234567890");
```

### Revalidate Objects via Stripe API

To always fetch the latest entity from Stripe instead of trusting webhook payloads:

```typescript
const stripeSync = new StripeSync({
  // ... other config
  revalidateObjectsViaStripeApi: [
    "customer",
    "invoice",
    "subscription",
    "payment_intent",
  ],
});
```

### Custom Logger

Use a custom logger (Pino):

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

const stripeSync = new StripeSync({
  // ... other config
  logger: logger,
});
```

## 📚 Available Stripe Objects

The following Stripe objects are synced to your database:

- `customers` - Customer records
- `invoices` - Invoice records
- `products` - Product catalog
- `prices` - Pricing information
- `subscriptions` - Subscription records
- `payment_intents` - Payment attempts
- `payment_methods` - Saved payment methods
- `charges` - Charge records
- `refunds` - Refund records
- `disputes` - Dispute records
- `credit_notes` - Credit note records
- And more...

All tables are created in the `stripe` schema. Check your database to see the full list.

## 🧪 Testing

### Test Webhook Locally

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux/Windows - see https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Trigger test events:
   ```bash
   stripe trigger payment_intent.succeeded
   stripe trigger customer.created
   ```

### Verify Data in Database

```sql
-- Check synced customers
SELECT * FROM stripe.customers LIMIT 10;

-- Check synced invoices
SELECT * FROM stripe.invoices ORDER BY created DESC LIMIT 10;

-- Check synced products
SELECT * FROM stripe.products;
```

## 🐛 Troubleshooting

### Migration Errors

If migrations fail:
1. Ensure `DATABASE_URL` is correct and accessible
2. Check database user has permission to create schemas
3. Verify PostgreSQL version is 12+ (recommended: 14+)

### Webhook Errors

If webhooks fail:
1. Verify `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
2. Check webhook endpoint URL is correct
3. Ensure webhook events are enabled in Stripe Dashboard
4. Check server logs for detailed error messages

### Connection Pool Errors

If you see connection pool errors:
1. Increase `max` connections in `poolConfig`
2. Check database connection limits
3. Ensure connections are properly closed

### Missing Data

If data isn't syncing:
1. Verify webhook is receiving events (check Stripe Dashboard)
2. Check webhook handler is being called
3. Verify database schema exists: `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'stripe';`
4. Check for errors in server logs

## 📖 Additional Resources

- [stripe-sync-engine GitHub Repository](https://github.com/ashutoshpw/stripe-sync-engine)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ✅ Checklist

- [ ] Installed `stripe-sync-engine` and `pg` packages
- [ ] Added environment variables to `.env.local`
- [ ] Created `getStripeSync()` utility function
- [ ] Ran database migrations
- [ ] Updated webhook handler to use stripe-sync-engine
- [ ] Configured webhook endpoint in Stripe Dashboard
- [ ] Tested webhook with Stripe CLI
- [ ] Verified data is syncing to database
- [ ] (Optional) Created backfill script for historical data

## 🎉 You're Done!

Your Stripe data is now automatically syncing to your PostgreSQL database. You can query it directly, build analytics dashboards, and integrate it with your application logic without making constant API calls to Stripe.
