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
    return apiError("Connecte-toi pour continuer.", 401);
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return apiError("Aucun compte de facturation — abonne-toi d'abord.", 404);
  }

  // Some accounts have a non-Stripe placeholder in stripe_customer_id (e.g.
  // manually-granted premium access) — Stripe would throw "No such
  // customer" on those, which surfaced as an unhandled 500. Fail cleanly
  // instead; never touch the subscriptions row here.
  if (!subscription.stripe_customer_id.startsWith("cus_")) {
    console.error(
      `[api/stripe/portal] user ${user.id} has a non-Stripe customer id: ${subscription.stripe_customer_id}`
    );
    return apiError(
      "Ton abonnement n'est pas encore relié à un compte de facturation Stripe. Contacte le support pour régulariser ton accès.",
      409
    );
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/settings`,
  });

  return apiSuccess({ url: session.url });
}
