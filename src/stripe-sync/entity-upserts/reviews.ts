import Stripe from "stripe";
import { reviewSchema } from "../../schemas/review";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCharges } from "./charges";
import { backfillPaymentIntents } from "./payment-intents";

export async function upsertReviews(
  context: StripeSyncContext,
  reviews: Stripe.Review[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Review[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillPaymentIntents(context, getUniqueIds(reviews, "payment_intent")),
      backfillCharges(context, getUniqueIds(reviews, "charge")),
    ]);
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    reviews,
    context.postgresClient.getTableName("reviews"),
    reviewSchema,
    syncTimestamp
  );
}
