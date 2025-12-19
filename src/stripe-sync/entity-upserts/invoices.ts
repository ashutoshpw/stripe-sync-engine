import Stripe from "stripe";
import { invoices as invoicesTable } from "../../drizzle-schema/invoices";
import { StripeSyncContext } from "../types";
import { expandEntity, fetchMissingEntities, getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";
import { backfillSubscriptions } from "./subscriptions";

export async function upsertInvoices(
  context: StripeSyncContext,
  invoices: Stripe.Invoice[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Invoice[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillCustomers(context, getUniqueIds(invoices, "customer")),
      backfillSubscriptions(context, getUniqueIds(invoices, "subscription")),
    ]);
  }

  await expandEntity(context, invoices, "lines", (id) =>
    context.stripe.invoices.listLineItems(id, { limit: 100 })
  );

  return context.postgresClient.upsertManyWithTimestampProtection(
    invoices,
    "invoices",
    invoicesTable,
    syncTimestamp
  );
}

export async function backfillInvoices(context: StripeSyncContext, invoiceIds: string[]) {
  const missingIds = await context.postgresClient.findMissingEntries(
    "invoices",
    invoiceIds
  );
  await fetchMissingEntities(missingIds, (id) => context.stripe.invoices.retrieve(id)).then(
    (entries) => upsertInvoices(context, entries)
  );
}
