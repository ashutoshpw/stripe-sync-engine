import { text, integer, timestamp } from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const setupIntents = stripeSchema.table("setup_intents", {
  id: text("id").primaryKey(),
  object: text("object"),
  created: integer("created"),
  customer: text("customer"),
  description: text("description"),
  paymentMethod: text("payment_method"),
  status: text("status"),
  usage: text("usage"),
  cancellationReason: text("cancellation_reason"),
  latestAttempt: text("latest_attempt"),
  mandate: text("mandate"),
  singleUseMandate: text("single_use_mandate"),
  onBehalfOf: text("on_behalf_of"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

