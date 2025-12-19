import Stripe from "stripe";
import { creditNotes as creditNotesTable } from "../../drizzle-schema/credit_note";
import { StripeSyncContext } from "../types";
import { expandEntity, getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";
import { backfillInvoices } from "./invoices";

export async function upsertCreditNotes(
  context: StripeSyncContext,
  creditNotes: Stripe.CreditNote[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.CreditNote[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillCustomers(context, getUniqueIds(creditNotes, "customer")),
      backfillInvoices(context, getUniqueIds(creditNotes, "invoice")),
    ]);
  }

  await expandEntity(context, creditNotes, "lines", (id) =>
    context.stripe.creditNotes.listLineItems(id, { limit: 100 })
  );

  return context.postgresClient.upsertManyWithTimestampProtection(
    creditNotes,
    "credit_notes",
    creditNotesTable,
    syncTimestamp
  );
}
