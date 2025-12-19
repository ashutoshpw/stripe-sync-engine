import Stripe from "stripe";
import { paymentMethods as paymentMethodsTable } from "../../drizzle-schema/payment_methods";
import { StripeSyncContext } from "../types";
import { getUniqueIds } from "../utils";
import { backfillCustomers } from "./customers";

export async function upsertPaymentMethods(
  context: StripeSyncContext,
  paymentMethods: Stripe.PaymentMethod[],
  backfillRelatedEntities: boolean = false,
  syncTimestamp?: string
): Promise<Stripe.PaymentMethod[]> {
  if (backfillRelatedEntities ?? context.config.backfillRelatedEntities) {
    await backfillCustomers(context, getUniqueIds(paymentMethods, "customer"));
  }

  return context.postgresClient.upsertManyWithTimestampProtection(
    paymentMethods,
    "payment_methods",
    paymentMethodsTable,
    syncTimestamp
  );
}
