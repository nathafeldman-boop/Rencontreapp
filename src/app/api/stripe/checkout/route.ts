import { NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { getPlan } from "@/lib/stripe/plans";
import { clientEnv } from "@/lib/env";
import { apiError, apiSuccess, apiValidationError } from "@/lib/api/response";

const checkoutSchema = z.object({
  plan: z.enum(["premium_monthly", "premium_annual"]).default("premium_monthly"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return apiError("Unauthorized", 401);
  }

  const json = await request.json().catch(() => ({}));
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const plan = getPlan(parsed.data.plan);
  const priceId = plan?.getPriceId();

  if (!plan || !priceId) {
    return apiError(`Plan "${parsed.data.plan}" isn't configured yet.`, 422);
  }

  const stripe = getStripeClient();

  // No `stripe_customer_id` is looked up or written here — `subscriptions`
  // writes are service-role-only (see 0001_init.sql RLS). Stripe creates
  // the customer from `customer_email`, and the webhook persists
  // everything (including the resulting customer id) once payment is
  // actually confirmed.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id, plan: plan.id } },
    success_url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
    cancel_url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/paywall?checkout=cancelled`,
  });

  if (!session.url) {
    return apiError("Couldn't start checkout — try again.", 502);
  }

  return apiSuccess({ url: session.url });
}
