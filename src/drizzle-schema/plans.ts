import {
  text,
  boolean,
  bigint,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const plans = stripeSchema.table("plans", {
  id: text("id").primaryKey(),
  object: text("object"),
  active: boolean("active"),
  amount: bigint("amount", { mode: "number" }),
  created: integer("created"),
  product: text("product"),
  currency: text("currency"),
  interval: text("interval"),
  livemode: boolean("livemode"),
  metadata: jsonb("metadata"),
  nickname: text("nickname"),
  tiersMode: text("tiers_mode"),
  usageType: text("usage_type"),
  billingScheme: text("billing_scheme"),
  intervalCount: bigint("interval_count", { mode: "number" }),
  aggregateUsage: text("aggregate_usage"),
  transformUsage: jsonb("transform_usage"),
  trialPeriodDays: bigint("trial_period_days", { mode: "number" }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

