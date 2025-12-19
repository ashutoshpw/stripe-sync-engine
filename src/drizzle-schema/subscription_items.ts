import {
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const subscriptionItems = stripeSchema.table("subscription_items", {
  id: text("id").primaryKey(),
  object: text("object"),
  billingThresholds: jsonb("billing_thresholds"),
  created: integer("created"),
  deleted: boolean("deleted"),
  metadata: jsonb("metadata"),
  quantity: integer("quantity"),
  price: text("price"),
  subscription: text("subscription"),
  taxRates: jsonb("tax_rates"),
  currentPeriodEnd: integer("current_period_end"),
  currentPeriodStart: integer("current_period_start"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

