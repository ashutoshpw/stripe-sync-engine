import Stripe from "stripe";
import { taxIds as taxIdsTable } from "../../drizzle-schema/tax_ids";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";

export async function upsertTaxIds(
  context: StripeSyncContext,
  taxIds: Stripe.TaxId[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.TaxId[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await backfillCustomers(context, getUniqueIds(taxIds, "customer"));
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    taxIds,
    "tax_ids",
    taxIdsTable,
    syncTimestamp
  );
}

export async function deleteTaxId(context: StripeSyncContext, id: string): Promise<boolean> {
  return context.postgresClient.delete("tax_ids", id);
}
