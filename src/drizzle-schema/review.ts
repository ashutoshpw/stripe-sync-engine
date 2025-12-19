import {
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const reviews = stripeSchema.table("reviews", {
  id: text("id").primaryKey(),
  object: text("object"),
  billingZip: text("billing_zip"),
  charge: text("charge"),
  created: integer("created"),
  closedReason: text("closed_reason"),
  livemode: boolean("livemode"),
  ipAddress: text("ip_address"),
  ipAddressLocation: jsonb("ip_address_location"),
  open: boolean("open"),
  openedReason: text("opened_reason"),
  paymentIntent: text("payment_intent"),
  reason: text("reason"),
  session: text("session"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

