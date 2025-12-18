import Stripe from "stripe";
import { StripeSyncContext } from "../types";
import { paymentMethodsSchema } from "../../schemas/payment_methods";
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
    context.postgresClient.getTableName("payment_methods"),
    paymentMethodsSchema,
    syncTimestamp
  );
}
