import {
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const activeEntitlements = stripeSchema.table("active_entitlements", {
  id: text("id").primaryKey(),
  object: text("object"),
  livemode: boolean("livemode"),
  feature: text("feature"),
  customer: text("customer"),
  lookupKey: text("lookup_key").unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

