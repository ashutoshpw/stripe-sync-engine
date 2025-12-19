import {
  text,
  boolean,
  bigint,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const events = stripeSchema.table("events", {
  id: text("id").primaryKey(),
  object: text("object"),
  data: jsonb("data"),
  type: text("type"),
  created: integer("created"),
  request: text("request"),
  updated: integer("updated"),
  livemode: boolean("livemode"),
  apiVersion: text("api_version"),
  pendingWebhooks: bigint("pending_webhooks", { mode: "number" }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

