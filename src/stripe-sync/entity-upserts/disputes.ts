import Stripe from "stripe";
import { disputeSchema } from "../../schemas/dispute";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCharges } from "./charges";

export async function upsertDisputes(
  context: StripeSyncContext,
  disputes: Stripe.Dispute[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Dispute[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await backfillCharges(context, getUniqueIds(disputes, "charge"));
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    disputes,
    context.postgresClient.getTableName("disputes"),
    disputeSchema,
    syncTimestamp
  );
}
