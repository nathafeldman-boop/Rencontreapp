import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { serverEnv } from "@/lib/env";
import { syncSubscriptionFromStripe } from "@/lib/stripe/sync-subscription";
import { recordAffiliateCommissionIfApplicable } from "@/lib/affiliates/record-commission";
import { trackServer } from "@/lib/analytics/server";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { planIdFromPriceId } from "@/lib/stripe/plans";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, serverEnv.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (userId && session.subscription) {
          const subscriptionId =
            typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscriptionFromStripe(subscription, userId);
          await recordAffiliateCommissionIfApplicable(userId, session);

          const priceId = subscription.items.data[0]?.price.id;
          trackServer(userId, AnalyticsEvent.SubscriptionCreated, {
            plan: planIdFromPriceId(priceId) as "premium_monthly" | "premium_annual",
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        if (userId) {
          await syncSubscriptionFromStripe(subscription, userId);

          if (subscription.status === "canceled") {
            const priceId = subscription.items.data[0]?.price.id;
            trackServer(userId, AnalyticsEvent.SubscriptionCanceled, {
              plan: planIdFromPriceId(priceId) as "premium_monthly" | "premium_annual",
            });
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Signature already verified — a processing failure here should not
    // read as "malicious request", but Stripe should still retry.
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook handler failed: ${message}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
