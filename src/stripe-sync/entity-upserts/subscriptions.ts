import Stripe from "stripe";
import { sql } from "drizzle-orm";
import { subscriptions as subscriptionsTable } from "../../drizzle-schema/subscriptions";
import { subscriptionItems as subscriptionItemsTable } from "../../drizzle-schema/subscription_items";
import { StripeSyncContext } from "../types";
import { expandEntity, fetchMissingEntities, getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";

export async function upsertSubscriptions(
  context: StripeSyncContext,
  subscriptions: Stripe.Subscription[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Subscription[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    const customerIds = getUniqueIds(subscriptions, "customer");

    await backfillCustomers(context, customerIds);
  }

  await expandEntity(context, subscriptions, "items", (id) =>
    context.stripe.subscriptionItems.list({ subscription: id, limit: 100 })
  );

  const rows = await context.postgresClient.upsertManyWithTimestampProtection(
    subscriptions,
    "subscriptions",
    subscriptionsTable,
    syncTimestamp
  );

  const allSubscriptionItems = subscriptions.flatMap((subscription) => subscription.items.data);
  await upsertSubscriptionItems(context, allSubscriptionItems, syncTimestamp);

  const markSubscriptionItemsDeleted: Promise<{ rowCount: number }>[] = [];
  for (const subscription of subscriptions) {
    const subscriptionItems = subscription.items.data;
    const subItemIds = subscriptionItems.map((x: Stripe.SubscriptionItem) => x.id);
    markSubscriptionItemsDeleted.push(
      markDeletedSubscriptionItems(context, subscription.id, subItemIds)
    );
  }
  await Promise.all(markSubscriptionItemsDeleted);

  return rows;
}

export async function upsertSubscriptionItems(
  context: StripeSyncContext,
  subscriptionItems: Stripe.SubscriptionItem[],
  syncTimestamp?: string
) {
  const modifiedSubscriptionItems = subscriptionItems.map((subscriptionItem) => {
    const priceId = subscriptionItem.price.id.toString();
    const deleted = subscriptionItem.deleted;
    const quantity = subscriptionItem.quantity;
    return {
      ...subscriptionItem,
      price: priceId,
      deleted: deleted ?? false,
      quantity: quantity ?? null,
    };
  });

  await context.postgresClient.upsertManyWithTimestampProtection(
    modifiedSubscriptionItems,
    "subscription_items",
    subscriptionItemsTable,
    syncTimestamp
  );
}

export async function markDeletedSubscriptionItems(
  context: StripeSyncContext,
  subscriptionId: string,
  currentSubItemIds: string[]
): Promise<{ rowCount: number }> {
  const schema = context.postgresClient.getSchema();
  const tableName = context.postgresClient.getTableName("subscription_items");
  const query = sql`
    SELECT id FROM ${sql.identifier(schema)}.${sql.identifier(tableName)}
    WHERE subscription = ${subscriptionId} AND deleted = false
  `;
  const result = await context.postgresClient.drizzle.execute(query);
  const rows = result.rows ?? [];
  const deletedIds = rows.filter(
    ({ id }: { id: string }) => currentSubItemIds.includes(id) === false
  );

  if (deletedIds.length > 0) {
    const ids = deletedIds.map(({ id }: { id: string }) => id);
    const updateQuery = sql`
      UPDATE ${sql.identifier(schema)}.${sql.identifier(tableName)}
      SET deleted = true WHERE id = ANY(${ids}::text[])
    `;
    const updateResult = await context.postgresClient.drizzle.execute(updateQuery);
    return { rowCount: updateResult.rowCount || 0 };
  } else {
    return { rowCount: 0 };
  }
}

export async function backfillSubscriptions(context: StripeSyncContext, subscriptionIds: string[]) {
  const missingSubscriptionIds = await context.postgresClient.findMissingEntries(
    "subscriptions",
    subscriptionIds
  );

  await fetchMissingEntities(missingSubscriptionIds, (id) =>
    context.stripe.subscriptions.retrieve(id)
  ).then((subscriptions) => upsertSubscriptions(context, subscriptions));
}
