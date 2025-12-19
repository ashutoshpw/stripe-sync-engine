import Stripe from "stripe";
import { subscriptionSchedules as subscriptionSchedulesTable } from "../../drizzle-schema/subscription_schedules";
import { StripeSyncContext } from "../types";
import { fetchMissingEntities, getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";

export async function upsertSubscriptionSchedules(
  context: StripeSyncContext,
  subscriptionSchedules: Stripe.SubscriptionSchedule[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.SubscriptionSchedule[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    const customerIds = getUniqueIds(subscriptionSchedules, "customer");

    await backfillCustomers(context, customerIds);
  }

  const rows = await context.postgresClient.upsertManyWithTimestampProtection(
    subscriptionSchedules,
    "subscription_schedules",
    subscriptionSchedulesTable,
    syncTimestamp
  );

  return rows;
}

export async function backfillSubscriptionSchedules(
  context: StripeSyncContext,
  subscriptionIds: string[]
) {
  const missingSubscriptionIds = await context.postgresClient.findMissingEntries(
    "subscription_schedules",
    subscriptionIds
  );

  await fetchMissingEntities(missingSubscriptionIds, (id) =>
    context.stripe.subscriptionSchedules.retrieve(id)
  ).then((subscriptionSchedules) => upsertSubscriptionSchedules(context, subscriptionSchedules));
}
