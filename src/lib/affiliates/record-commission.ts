import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Called from the Stripe webhook on `checkout.session.completed`. If the
 * buyer was attributed to an affiliate (see attribute-signup.ts), records a
 * commission on the actual amount paid — net of any coupon, since
 * `amount_total` already reflects that.
 *
 * Keyed on `session.id` so a Stripe webhook retry (same event delivered
 * twice) can never insert the commission twice; the unique constraint on
 * `stripe_checkout_session_id` turns a duplicate insert into a no-op error
 * we deliberately ignore.
 */
export async function recordAffiliateCommissionIfApplicable(userId: string, session: Stripe.Checkout.Session) {
  const amountCents = session.amount_total ?? 0;
  if (amountCents <= 0) return;

  const supabase = createAdminClient();

  const { data: referral } = await supabase
    .from("affiliate_referrals")
    .select("affiliate_id")
    .eq("referred_user_id", userId)
    .maybeSingle();

  if (!referral) return;

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, commission_rate, active")
    .eq("id", referral.affiliate_id)
    .maybeSingle();

  if (!affiliate || !affiliate.active) return;

  const commissionCents = Math.round(amountCents * affiliate.commission_rate);
  if (commissionCents <= 0) return;

  await supabase.from("affiliate_commissions").insert({
    affiliate_id: affiliate.id,
    referred_user_id: userId,
    stripe_checkout_session_id: session.id,
    amount_cents: amountCents,
    commission_cents: commissionCents,
  });
}
