import {
  text,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const features = stripeSchema.table("features", {
  id: text("id").primaryKey(),
  object: text("object"),
  livemode: boolean("livemode"),
  name: text("name"),
  lookupKey: text("lookup_key").unique(),
  active: boolean("active"),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

