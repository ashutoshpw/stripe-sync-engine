import {
  text,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const refunds = stripeSchema.table("refunds", {
  id: text("id").primaryKey(),
  object: text("object"),
  amount: integer("amount"),
  balanceTransaction: text("balance_transaction"),
  charge: text("charge"),
  created: integer("created"),
  currency: text("currency"),
  destinationDetails: jsonb("destination_details"),
  metadata: jsonb("metadata"),
  paymentIntent: text("payment_intent"),
  reason: text("reason"),
  receiptNumber: text("receipt_number"),
  sourceTransferReversal: text("source_transfer_reversal"),
  status: text("status"),
  transferReversal: text("transfer_reversal"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

