/**
 * Table name resolver module for stripe-sync-engine.
 * Provides utilities to handle table name prefixing.
 */

export const BASE_TABLE_NAMES = {
  products: "products",
  customers: "customers",
  prices: "prices",
  subscriptions: "subscriptions",
  subscription_items: "subscription_items",
  invoices: "invoices",
  charges: "charges",
  disputes: "disputes",
  plans: "plans",
  setup_intents: "setup_intents",
  payment_methods: "payment_methods",
  payment_intents: "payment_intents",
  tax_ids: "tax_ids",
  credit_notes: "credit_notes",
  early_fraud_warnings: "early_fraud_warnings",
  reviews: "reviews",
  refunds: "refunds",
  subscription_schedules: "subscription_schedules",
  checkout_sessions: "checkout_sessions",
  checkout_session_line_items: "checkout_session_line_items",
  features: "features",
  active_entitlements: "active_entitlements",
  coupons: "coupons",
  events: "events",
  payouts: "payouts",
} as const;

export type TableName = keyof typeof BASE_TABLE_NAMES;

/**
 * Normalizes a table prefix by ensuring it ends with an underscore.
 * Returns empty string if no prefix is provided.
 *
 * @param prefix - The prefix to normalize
 * @returns Normalized prefix with trailing underscore, or empty string
 *
 * @example
 * normalizePrefix('billing')   // 'billing_'
 * normalizePrefix('billing_')  // 'billing_'
 * normalizePrefix('')          // ''
 * normalizePrefix(undefined)   // ''
 */
export function normalizePrefix(prefix?: string): string {
  if (!prefix) return "";
  return prefix.endsWith("_") ? prefix : `${prefix}_`;
}

/**
 * Returns the full table name with the configured prefix.
 *
 * @param table - The base table name
 * @param prefix - Optional prefix (will be normalized)
 * @returns Full table name with prefix
 *
 * @example
 * getTableName('products', 'billing')   // 'billing_products'
 * getTableName('products', 'billing_')  // 'billing_products'
 * getTableName('products', '')          // 'products'
 * getTableName('products')              // 'products'
 */
export function getTableName(table: TableName, prefix?: string): string {
  const normalizedPrefix = normalizePrefix(prefix);
  return `${normalizedPrefix}${BASE_TABLE_NAMES[table]}`;
}
