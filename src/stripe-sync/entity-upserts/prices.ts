import Stripe from "stripe";
import { prices as pricesTable } from "../../drizzle-schema/prices";
import { StripeSyncContext } from "../types";
import { fetchMissingEntities, getUniqueIds } from "../utils";
import { backfillProducts } from "./products";

export async function upsertPrices(
  context: StripeSyncContext,
  prices: Stripe.Price[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Price[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await backfillProducts(context, getUniqueIds(prices, "product"));
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    prices,
    "prices",
    pricesTable,
    syncTimestamp
  );
}

export async function deletePrice(context: StripeSyncContext, id: string): Promise<boolean> {
  return context.postgresClient.delete("prices", id);
}

export async function backfillPrices(context: StripeSyncContext, priceIds: string[]) {
  const missingIds = await context.postgresClient.findMissingEntries(
    "prices",
    priceIds
  );
  await fetchMissingEntities(missingIds, (id) => context.stripe.prices.retrieve(id)).then(
    (entries) => upsertPrices(context, entries)
  );
}
