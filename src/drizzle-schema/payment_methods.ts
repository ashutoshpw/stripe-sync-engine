import { text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const paymentMethods = stripeSchema.table("payment_methods", {
  id: text("id").primaryKey(),
  object: text("object"),
  created: integer("created"),
  customer: text("customer"),
  type: text("type"),
  billingDetails: jsonb("billing_details"),
  metadata: jsonb("metadata"),
  card: jsonb("card"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

