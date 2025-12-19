import {
  text,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"

export const customers = stripeSchema.table("customers", {
  id: text("id").primaryKey(),
  object: text("object"),
  address: jsonb("address"),
  description: text("description"),
  email: text("email"),
  metadata: jsonb("metadata"),
  name: text("name"),
  phone: text("phone"),
  shipping: jsonb("shipping"),
  balance: integer("balance"),
  created: integer("created"),
  currency: text("currency"),
  defaultSource: text("default_source"),
  delinquent: boolean("delinquent"),
  discount: jsonb("discount"),
  invoicePrefix: text("invoice_prefix"),
  invoiceSettings: jsonb("invoice_settings"),
  livemode: boolean("livemode"),
  nextInvoiceSequence: integer("next_invoice_sequence"),
  preferredLocales: jsonb("preferred_locales"),
  taxExempt: text("tax_exempt"),
  deleted: boolean("deleted"),
  updatedAt: integer("updated_at"),
})

