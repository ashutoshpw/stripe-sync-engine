import {
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema, pricingTypeEnum, pricingTiersEnum } from "./enums"

export const prices = stripeSchema.table("prices", {
  id: text("id").primaryKey(),
  object: text("object"),
  active: boolean("active"),
  currency: text("currency"),
  metadata: jsonb("metadata"),
  nickname: text("nickname"),
  recurring: jsonb("recurring"),
  type: pricingTypeEnum("type"),
  unitAmount: integer("unit_amount"),
  billingScheme: text("billing_scheme"),
  created: integer("created"),
  livemode: boolean("livemode"),
  lookupKey: text("lookup_key"),
  tiersMode: pricingTiersEnum("tiers_mode"),
  transformQuantity: jsonb("transform_quantity"),
  unitAmountDecimal: text("unit_amount_decimal"),
  product: text("product"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

