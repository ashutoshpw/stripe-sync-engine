import { Handlers } from "$fresh/server.ts"
import { stripeSync } from "../../../utils/stripeSync.ts"

export const handler: Handlers = {
  async POST(req) {
    try {
      const signature = req.headers.get("stripe-signature") ?? undefined
      const payload = await req.text()

      await stripeSync.processWebhook(payload, signature)

      return new Response(
        JSON.stringify({ received: true }),
        {
          headers: { "Content-Type": "application/json" },
        }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error("Webhook processing failed", message)
      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
  },
}

