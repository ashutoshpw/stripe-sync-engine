import { Handlers } from "$fresh/server.ts"
import { stripeSync } from "../../../../utils/stripeSync.ts"

export const handler: Handlers = {
  async POST(_req, ctx) {
    try {
      const id = ctx.params.id
      await stripeSync.syncSingleEntity(id)
      return new Response(
        JSON.stringify({ status: "synced", id }),
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


