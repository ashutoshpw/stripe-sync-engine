import { Handlers } from "$fresh/server.ts"
import { runMigrations } from "stripe-sync-engine"
import { databaseUrl, schema } from "../../../utils/stripeSync.ts"

export const handler: Handlers = {
  async POST(_req) {
    try {
      await runMigrations({ databaseUrl, schema })
      return new Response(
        JSON.stringify({ status: "migrated" }),
        {
          headers: { "Content-Type": "application/json" },
        }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
  },
}


