import {
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const products = stripeSchema.table("products", {
  id: text("id").primaryKey(),
  object: text("object"),
  active: boolean("active"),
  description: text("description"),
  metadata: jsonb("metadata"),
  name: text("name"),
  created: integer("created"),
  images: jsonb("images"),
  livemode: boolean("livemode"),
  packageDimensions: jsonb("package_dimensions"),
  shippable: boolean("shippable"),
  statementDescriptor: text("statement_descriptor"),
  unitLabel: text("unit_label"),
  updated: integer("updated"),
  url: text("url"),
  marketingFeatures: jsonb("marketing_features"),
  defaultPrice: text("default_price"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
})

