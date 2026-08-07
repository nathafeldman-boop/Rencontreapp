import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { serverEnv } from "@/lib/env";

/**
 * Signature verification is wired up now so the endpoint is safe to point
 * Stripe at as soon as it exists. The event handlers themselves are
 * intentionally TODO — writing to `subscriptions` (via the service-role
 * client in src/lib/supabase/admin.ts) lands with the Checkout flow in a
 * later step.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      body,
      signature,
      serverEnv.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      // TODO: upsert `subscriptions` (plan, status, stripe ids) for the
      // customer, then trackServer(..., AnalyticsEvent.SubscriptionPurchased, ...)
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // TODO: sync `subscriptions.status` / `current_period_end`
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
