import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { planIdFromPriceId } from "@/lib/stripe/plans";
import type { SubscriptionStatus } from "@/types/database.types";

const STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  unpaid: "past_due",
  paused: "canceled",
};

/**
 * Single place that writes `subscriptions` from Stripe state — called from
 * the webhook for `checkout.session.completed`, `customer.subscription.updated`,
 * and `customer.subscription.deleted`. Uses the admin client because RLS
 * intentionally blocks the `authenticated` role from writing this table
 * (see 0001_init.sql).
 */
export async function syncSubscriptionFromStripe(subscription: Stripe.Subscription, userId: string) {
  const priceId = subscription.items.data[0]?.price.id;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const supabase = createAdminClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id:
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripe_subscription_id: subscription.id,
      plan: planIdFromPriceId(priceId),
      status: STATUS_MAP[subscription.status],
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(`Failed to sync subscription for user ${userId}: ${error.message}`);
  }
}
