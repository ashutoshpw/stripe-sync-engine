import { Handlers } from "$fresh/server.ts"
import { stripeSync } from "../../../utils/stripeSync.ts"

export const handler: Handlers = {
  async POST(_req) {
    try {
      const result = await stripeSync.syncBackfill({ object: "all" })
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      })
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


