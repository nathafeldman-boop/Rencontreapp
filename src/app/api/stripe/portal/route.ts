import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { clientEnv } from "@/lib/env";
import { apiError, apiSuccess } from "@/lib/api/response";

/**
 * Opens the Stripe-hosted Billing Portal so a subscriber can update their
 * payment method, change plan, or cancel — the "page billing" the product
 * spec asks for, without us having to build subscription-management UI.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return apiError("No billing account yet — subscribe first.", 404);
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/settings`,
  });

  return apiSuccess({ url: session.url });
}
