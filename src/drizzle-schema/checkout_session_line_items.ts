import {
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core"
import { stripeSchema } from "./enums"
import { prices } from "./prices"
import { checkoutSessions } from "./checkout_sessions"

export const checkoutSessionLineItems = stripeSchema.table(
  "checkout_session_line_items",
  {
    id: text("id").primaryKey(),
    object: text("object"),
    amountDiscount: integer("amount_discount"),
    amountSubtotal: integer("amount_subtotal"),
    amountTax: integer("amount_tax"),
    amountTotal: integer("amount_total"),
    currency: text("currency"),
    description: text("description"),
    price: text("price").references(() => prices.id, { onDelete: "cascade" }),
    quantity: integer("quantity"),
    checkoutSession: text("checkout_session").references(
      () => checkoutSessions.id,
      { onDelete: "cascade" }
    ),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
  }
)

