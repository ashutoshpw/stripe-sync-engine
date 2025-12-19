import {
  text,
  boolean,
  bigint,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const payouts = stripeSchema.table("payouts", {
  id: text("id").primaryKey(),
  object: text("object"),
  date: text("date"),
  type: text("type"),
  amount: bigint("amount", { mode: "number" }),
  method: text("method"),
  status: text("status"),
  created: integer("created"),
  updated: integer("updated"),
  currency: text("currency"),
  livemode: boolean("livemode"),
  metadata: jsonb("metadata"),
  automatic: boolean("automatic"),
  recipient: text("recipient"),
  description: text("description"),
  destination: text("destination"),
  sourceType: text("source_type"),
  arrivalDate: text("arrival_date"),
  bankAccount: jsonb("bank_account"),
  failureCode: text("failure_code"),
  transferGroup: text("transfer_group"),
  amountReversed: bigint("amount_reversed", { mode: "number" }),
  failureMessage: text("failure_message"),
  sourceTransaction: text("source_transaction"),
  balanceTransaction: text("balance_transaction"),
  statementDescriptor: text("statement_descriptor"),
  statementDescription: text("statement_description"),
  failureBalanceTransaction: text("failure_balance_transaction"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

