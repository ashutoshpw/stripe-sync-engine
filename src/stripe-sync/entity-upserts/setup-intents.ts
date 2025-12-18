import Stripe from "stripe";
import { setupIntentsSchema } from "../../schemas/setup_intents";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";

export async function upsertSetupIntents(
  context: StripeSyncContext,
  setupIntents: Stripe.SetupIntent[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.SetupIntent[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await backfillCustomers(context, getUniqueIds(setupIntents, "customer"));
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    setupIntents,
    context.postgresClient.getTableName("setup_intents"),
    setupIntentsSchema,
    syncTimestamp
  );
}
