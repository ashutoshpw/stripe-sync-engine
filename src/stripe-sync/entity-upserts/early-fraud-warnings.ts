import Stripe from "stripe";
import { earlyFraudWarnings as earlyFraudWarningsTable } from "../../drizzle-schema/early_fraud_warning";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCharges } from "./charges";
import { backfillPaymentIntents } from "./payment-intents";

export async function upsertEarlyFraudWarning(
  context: StripeSyncContext,
  earlyFraudWarnings: Stripe.Radar.EarlyFraudWarning[],
  backfillRelatedEntities?: boolean,
  syncTimestamp?: string
): Promise<Stripe.Radar.EarlyFraudWarning[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await Promise.all([
      backfillPaymentIntents(context, getUniqueIds(earlyFraudWarnings, "payment_intent")),
      backfillCharges(context, getUniqueIds(earlyFraudWarnings, "charge")),
    ]);
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    earlyFraudWarnings,
    "early_fraud_warnings",
    earlyFraudWarningsTable,
    syncTimestamp
  );
}
