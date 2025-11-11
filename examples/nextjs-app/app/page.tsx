export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Stripe Sync Engine - Next.js Example</h1>
      <p>This example demonstrates using stripe-sync-engine with Next.js App Router.</p>
      <h2>Available API Endpoints</h2>
      <ul>
        <li>
          <code>GET /api/health</code> - Health check endpoint
        </li>
        <li>
          <code>POST /api/migrations/run</code> - Run database migrations
        </li>
        <li>
          <code>POST /api/sync/backfill</code> - Perform full backfill sync
        </li>
        <li>
          <code>POST /api/sync/entity/[id]</code> - Sync a single entity by ID
        </li>
        <li>
          <code>POST /api/webhooks/stripe</code> - Stripe webhook handler
        </li>
      </ul>
    </main>
  )
}

