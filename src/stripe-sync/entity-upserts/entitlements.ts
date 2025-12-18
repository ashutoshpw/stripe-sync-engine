import Stripe from "stripe";
import { pg as sql } from "yesql";
import { activeEntitlementSchema } from "../../schemas/active_entitlement";
import { featureSchema } from "../../schemas/feature";
import { StripeSyncContext } from "../types";
import { fetchMissingEntities, getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";

export async function upsertFeatures(
  context: StripeSyncContext,
  features: Stripe.Entitlements.Feature[],
  syncTimestamp?: string
) {
  return context.postgresClient.upsertManyWithTimestampProtection(
    features,
    context.postgresClient.getTableName("features"),
    featureSchema,
    syncTimestamp
  );
}

export async function backfillFeatures(context: StripeSyncContext, featureIds: string[]) {
  const missingFeatureIds = await context.postgresClient.findMissingEntries(
    context.postgresClient.getTableName("features"),
    featureIds
  );
  await fetchMissingEntities(missingFeatureIds, (id) =>
    context.stripe.entitlements.features.retrieve(id)
  )
    .then((features) => upsertFeatures(context, features))
    .catch((err) => {
      context.config.logger?.error(err, "Failed to backfill features");
      throw err;
    });
}

export async function upsertActiveEntitlements(
  context: StripeSyncContext,
  customerId: string,
  activeEntitlements: Stripe.Entitlements.ActiveEntitlement[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
) {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillCustomers(context, getUniqueIds(activeEntitlements, "customer")),
      backfillFeatures(context, getUniqueIds(activeEntitlements, "feature")),
    ]);
  }

  const entitlements = activeEntitlements.map((entitlement) => ({
    id: entitlement.id,
    object: entitlement.object,
    feature: typeof entitlement.feature === "string" ? entitlement.feature : entitlement.feature.id,
    customer: customerId,
    livemode: entitlement.livemode,
    lookup_key: entitlement.lookup_key,
  }));

  return context.postgresClient.upsertManyWithTimestampProtection(
    entitlements,
    context.postgresClient.getTableName("active_entitlements"),
    activeEntitlementSchema,
    syncTimestamp
  );
}

export async function deleteRemovedActiveEntitlements(
  context: StripeSyncContext,
  customerId: string,
  currentActiveEntitlementIds: string[]
): Promise<{ rowCount: number }> {
  const schema = context.postgresClient.getSchema();
  const tableName = context.postgresClient.getTableName("active_entitlements");
  const prepared = sql(`
      delete from "${schema}"."${tableName}"
      where customer = :customerId and id <> ALL(:currentActiveEntitlementIds::text[]);
      `)({ customerId, currentActiveEntitlementIds });
  const { rowCount } = await context.postgresClient.query(prepared.text, prepared.values);
  return { rowCount: rowCount || 0 };
}
