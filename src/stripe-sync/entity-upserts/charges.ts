import Stripe from "stripe";
import { chargeSchema } from "../../schemas/charge";
import { StripeSyncContext } from "../types";
import { expandEntity, fetchMissingEntities, getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";
import { backfillInvoices } from "./invoices";

export async function upsertCharges(
  context: StripeSyncContext,
  charges: Stripe.Charge[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Charge[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillCustomers(context, getUniqueIds(charges, "customer")),
      backfillInvoices(context, getUniqueIds(charges, "invoice")),
    ]);
  }

  await expandEntity(context, charges, "refunds", (id) =>
    context.stripe.refunds.list({ charge: id, limit: 100 })
  );

  return context.postgresClient.upsertManyWithTimestampProtection(
    charges,
    context.postgresClient.getTableName("charges"),
    chargeSchema,
    syncTimestamp
  );
}

export async function backfillCharges(context: StripeSyncContext, chargeIds: string[]) {
  const missingChargeIds = await context.postgresClient.findMissingEntries(
    context.postgresClient.getTableName("charges"),
    chargeIds
  );

  await fetchMissingEntities(missingChargeIds, (id) => context.stripe.charges.retrieve(id)).then(
    (charges) => upsertCharges(context, charges)
  );
}
