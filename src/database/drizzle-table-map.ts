import type { PgTable } from "drizzle-orm/pg-core"
import * as schema from "../drizzle-schema"
import type { TableName } from "./tableNames"

const tableMap: Record<TableName, PgTable> = {
  products: schema.products,
  customers: schema.customers,
  prices: schema.prices,
  subscriptions: schema.subscriptions,
  subscription_items: schema.subscriptionItems,
  invoices: schema.invoices,
  charges: schema.charges,
  disputes: schema.disputes,
  plans: schema.plans,
  setup_intents: schema.setupIntents,
  payment_methods: schema.paymentMethods,
  payment_intents: schema.paymentIntents,
  tax_ids: schema.taxIds,
  credit_notes: schema.creditNotes,
  early_fraud_warnings: schema.earlyFraudWarnings,
  reviews: schema.reviews,
  refunds: schema.refunds,
  subscription_schedules: schema.subscriptionSchedules,
  checkout_sessions: schema.checkoutSessions,
  checkout_session_line_items: schema.checkoutSessionLineItems,
  features: schema.features,
  active_entitlements: schema.activeEntitlements,
  coupons: schema.coupons,
  events: schema.events,
  payouts: schema.payouts,
}

export function getDrizzleTable(tableName: TableName): PgTable {
  return tableMap[tableName]
}

