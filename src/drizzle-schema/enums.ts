import { pgSchema, pgEnum } from "drizzle-orm/pg-core"

export const stripeSchema = pgSchema("stripe")

export const pricingTypeEnum = stripeSchema.enum("pricing_type", [
  "one_time",
  "recurring",
])

export const pricingTiersEnum = stripeSchema.enum("pricing_tiers", [
  "graduated",
  "volume",
])

export const subscriptionStatusEnum = stripeSchema.enum("subscription_status", [
  "trialing",
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
  "paused",
])

export const invoiceStatusEnum = stripeSchema.enum("invoice_status", [
  "draft",
  "open",
  "paid",
  "uncollectible",
  "void",
  "deleted",
])

export const subscriptionScheduleStatusEnum = stripeSchema.enum(
  "subscription_schedule_status",
  ["not_started", "active", "completed", "released", "canceled"]
)

