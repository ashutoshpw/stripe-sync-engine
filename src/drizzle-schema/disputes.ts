import {
  text,
  boolean,
  bigint,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const disputes = stripeSchema.table("disputes", {
  id: text("id").primaryKey(),
  object: text("object"),
  amount: bigint("amount", { mode: "number" }),
  charge: text("charge"),
  reason: text("reason"),
  status: text("status"),
  created: integer("created"),
  updated: integer("updated"),
  currency: text("currency"),
  evidence: jsonb("evidence"),
  livemode: boolean("livemode"),
  metadata: jsonb("metadata"),
  evidenceDetails: jsonb("evidence_details"),
  balanceTransactions: jsonb("balance_transactions"),
  isChargeRefundable: boolean("is_charge_refundable"),
  paymentIntent: text("payment_intent"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

