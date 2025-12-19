import Stripe from "stripe";
import { paymentIntents as paymentIntentsTable } from "../../drizzle-schema/payment_intents";
import { StripeSyncContext } from "../types";
import { fetchMissingEntities, getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";
import { backfillInvoices } from "./invoices";

export async function upsertPaymentIntents(
  context: StripeSyncContext,
  paymentIntents: Stripe.PaymentIntent[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.PaymentIntent[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillCustomers(context, getUniqueIds(paymentIntents, "customer")),
      backfillInvoices(context, getUniqueIds(paymentIntents, "invoice")),
    ]);
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    paymentIntents,
    "payment_intents",
    paymentIntentsTable,
    syncTimestamp
  );
}

export async function backfillPaymentIntents(
  context: StripeSyncContext,
  paymentIntentIds: string[]
) {
  const missingIds = await context.postgresClient.findMissingEntries(
    "payment_intents",
    paymentIntentIds
  );

  await fetchMissingEntities(missingIds, (id) => context.stripe.paymentIntents.retrieve(id)).then(
    (paymentIntents) => upsertPaymentIntents(context, paymentIntents)
  );
}
