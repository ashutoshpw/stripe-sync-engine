import {
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const earlyFraudWarnings = stripeSchema.table(
  "early_fraud_warnings",
  {
    id: text("id").primaryKey(),
    object: text("object"),
    actionable: boolean("actionable"),
    charge: text("charge"),
    created: integer("created"),
    fraudType: text("fraud_type"),
    livemode: boolean("livemode"),
    paymentIntent: text("payment_intent"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  }
)

