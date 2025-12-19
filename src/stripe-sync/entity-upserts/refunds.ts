import Stripe from "stripe";
import { refunds as refundsTable } from "../../drizzle-schema/refund";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCharges } from "./charges";
import { backfillPaymentIntents } from "./payment-intents";

export async function upsertRefunds(
  context: StripeSyncContext,
  refunds: Stripe.Refund[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Refund[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillPaymentIntents(context, getUniqueIds(refunds, "payment_intent")),
      backfillCharges(context, getUniqueIds(refunds, "charge")),
    ]);
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    refunds,
    "refunds",
    refundsTable,
    syncTimestamp
  );
}
