import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/response";

/**
 * Placeholder only — Stripe is prepared (client, env vars, `subscriptions`
 * table) but the Checkout flow itself is built in a later step.
 *
 * TODO:
 *  1. Look up (or create) a Stripe customer for `user.id`.
 *  2. `stripe.checkout.sessions.create({ mode: "subscription", ... })`
 *     with STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_ANNUAL from the body.
 *  3. Return `{ url: session.url }` for the client to redirect to.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError("Unauthorized", 401);
  }

  return apiError("Not implemented yet — Stripe Checkout lands in a later step.", 501);
}
