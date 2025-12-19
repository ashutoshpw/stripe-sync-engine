import {
  text,
  boolean,
  bigint,
  integer,
  doublePrecision,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const coupons = stripeSchema.table("coupons", {
  id: text("id").primaryKey(),
  object: text("object"),
  name: text("name"),
  valid: boolean("valid"),
  created: integer("created"),
  updated: integer("updated"),
  currency: text("currency"),
  duration: text("duration"),
  livemode: boolean("livemode"),
  metadata: jsonb("metadata"),
  redeemBy: integer("redeem_by"),
  amountOff: bigint("amount_off", { mode: "number" }),
  percentOff: doublePrecision("percent_off"),
  timesRedeemed: bigint("times_redeemed", { mode: "number" }),
  maxRedemptions: bigint("max_redemptions", { mode: "number" }),
  durationInMonths: bigint("duration_in_months", { mode: "number" }),
  percentOffPrecise: doublePrecision("percent_off_precise"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

