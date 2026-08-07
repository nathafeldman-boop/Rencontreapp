import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";

/**
 * Resolves a human-readable creator promo code (`creators.promo_code`, e.g.
 * "ALEX20") to the Stripe Promotion Code id needed for
 * `checkout.sessions.create({ discounts: [...] })`. The actual coupon
 * (percent off, duration) is configured in the Stripe Dashboard against a
 * Promotion Code with that same human-readable code — this only does the
 * lookup, it never invents a discount.
 */
export async function resolvePromoDiscount(
  promoCode: string
): Promise<Stripe.Checkout.SessionCreateParams.Discount | null> {
  const stripe = getStripeClient();

  const matches = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
  const match = matches.data[0];

  return match ? { promotion_code: match.id } : null;
}
