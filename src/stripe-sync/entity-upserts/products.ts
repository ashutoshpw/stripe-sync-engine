import Stripe from "stripe";
import { products as productsTable } from "../../drizzle-schema/products";
import { StripeSyncContext } from "../types";
import { fetchMissingEntities } from "../utils";

export async function upsertProducts(
  context: StripeSyncContext,
  products: Stripe.Product[],
  syncTimestamp?: string
): Promise<Stripe.Product[]> {
  return context.postgresClient.upsertManyWithTimestampProtection(
    products,
    "products",
    productsTable,
    syncTimestamp
  );
}

export async function deleteProduct(context: StripeSyncContext, id: string): Promise<boolean> {
  return context.postgresClient.delete("products", id);
}

export async function backfillProducts(context: StripeSyncContext, productIds: string[]) {
  const missingProductIds = await context.postgresClient.findMissingEntries(
    "products",
    productIds
  );

  await fetchMissingEntities(missingProductIds, (id) => context.stripe.products.retrieve(id)).then(
    (products) => upsertProducts(context, products)
  );
}
