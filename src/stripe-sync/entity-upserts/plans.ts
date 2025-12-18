import Stripe from "stripe";
import { planSchema } from "../../schemas/plan";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillProducts } from "./products";

export async function upsertPlans(
  context: StripeSyncContext,
  plans: Stripe.Plan[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Plan[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await backfillProducts(context, getUniqueIds(plans, "product"));
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    plans,
    context.postgresClient.getTableName("plans"),
    planSchema,
    syncTimestamp
  );
}

export async function deletePlan(context: StripeSyncContext, id: string): Promise<boolean> {
  return context.postgresClient.delete("plans", id);
}
