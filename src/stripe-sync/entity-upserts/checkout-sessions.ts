import Stripe from "stripe";
import { checkoutSessions as checkoutSessionsTable } from "../../drizzle-schema/checkout_sessions";
import { checkoutSessionLineItems as checkoutSessionLineItemsTable } from "../../drizzle-schema/checkout_session_line_items";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";
import { backfillInvoices } from "./invoices";
import { backfillPaymentIntents } from "./payment-intents";
import { backfillPrices } from "./prices";
import { backfillSubscriptions } from "./subscriptions";

export async function upsertCheckoutSessions(
  context: StripeSyncContext,
  checkoutSessions: Stripe.Checkout.Session[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Checkout.Session[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillCustomers(context, getUniqueIds(checkoutSessions, "customer")),
      backfillSubscriptions(context, getUniqueIds(checkoutSessions, "subscription")),
      backfillPaymentIntents(context, getUniqueIds(checkoutSessions, "payment_intent")),
      backfillInvoices(context, getUniqueIds(checkoutSessions, "invoice")),
    ]);
  }

  const rows = await context.postgresClient.upsertManyWithTimestampProtection(
    checkoutSessions,
    "checkout_sessions",
    checkoutSessionsTable,
    syncTimestamp
  );

  await fillCheckoutSessionsLineItems(
    context,
    checkoutSessions.map((cs) => cs.id),
    syncTimestamp
  );

  return rows;
}

export async function fillCheckoutSessionsLineItems(
  context: StripeSyncContext,
  checkoutSessionIds: string[],
  syncTimestamp?: string
) {
  for (const checkoutSessionId of checkoutSessionIds) {
    const lineItemResponses: Stripe.LineItem[] = [];

    for await (const lineItem of context.stripe.checkout.sessions.listLineItems(checkoutSessionId, {
      limit: 100,
    })) {
      lineItemResponses.push(lineItem);
    }

    await upsertCheckoutSessionLineItems(
      context,
      lineItemResponses,
      checkoutSessionId,
      syncTimestamp
    );
  }
}

export async function upsertCheckoutSessionLineItems(
  context: StripeSyncContext,
  lineItems: Stripe.LineItem[],
  checkoutSessionId: string,
  syncTimestamp?: string
) {
  await backfillPrices(
    context,
    lineItems
      .map((lineItem) => lineItem.price?.id?.toString() ?? undefined)
      .filter((id) => id !== undefined)
  );

  const modifiedLineItems = lineItems.map((lineItem) => {
    const priceId =
      typeof lineItem.price === "object" && lineItem.price?.id
        ? lineItem.price.id.toString()
        : lineItem.price?.toString() || null;

    return {
      ...lineItem,
      price: priceId,
      checkout_session: checkoutSessionId,
    };
  });

  await context.postgresClient.upsertManyWithTimestampProtection(
    modifiedLineItems,
    "checkout_session_line_items",
    checkoutSessionLineItemsTable,
    syncTimestamp
  );
}
