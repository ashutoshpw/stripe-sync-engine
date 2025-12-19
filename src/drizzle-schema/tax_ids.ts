import { text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const taxIds = stripeSchema.table("tax_ids", {
  id: text("id").primaryKey(),
  object: text("object"),
  country: text("country"),
  customer: text("customer"),
  type: text("type"),
  value: text("value"),
  created: integer("created").notNull(),
  livemode: boolean("livemode"),
  owner: jsonb("owner"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

