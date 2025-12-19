import {
  text,
  boolean,
  integer,
  jsonb,
  doublePrecision,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema, subscriptionStatusEnum } from "./enums"
import { customers } from "./customers"

export const subscriptions = stripeSchema.table("subscriptions", {
  id: text("id").primaryKey(),
  object: text("object"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end"),
  currentPeriodEnd: integer("current_period_end"),
  currentPeriodStart: integer("current_period_start"),
  defaultPaymentMethod: text("default_payment_method"),
  items: jsonb("items"),
  metadata: jsonb("metadata"),
  pendingSetupIntent: text("pending_setup_intent"),
  pendingUpdate: jsonb("pending_update"),
  status: subscriptionStatusEnum("status"),
  applicationFeePercent: doublePrecision("application_fee_percent"),
  billingCycleAnchor: integer("billing_cycle_anchor"),
  billingThresholds: jsonb("billing_thresholds"),
  cancelAt: integer("cancel_at"),
  canceledAt: integer("canceled_at"),
  collectionMethod: text("collection_method"),
  created: integer("created"),
  daysUntilDue: integer("days_until_due"),
  defaultSource: text("default_source"),
  defaultTaxRates: jsonb("default_tax_rates"),
  discount: jsonb("discount"),
  endedAt: integer("ended_at"),
  livemode: boolean("livemode"),
  nextPendingInvoiceItemInvoice: integer("next_pending_invoice_item_invoice"),
  pauseCollection: jsonb("pause_collection"),
  pendingInvoiceItemInterval: jsonb("pending_invoice_item_interval"),
  startDate: integer("start_date"),
  transferData: jsonb("transfer_data"),
  trialEnd: jsonb("trial_end"),
  trialStart: jsonb("trial_start"),
  schedule: text("schedule"),
  customer: text("customer").references(() => customers.id),
  latestInvoice: text("latest_invoice"),
  plan: text("plan"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

