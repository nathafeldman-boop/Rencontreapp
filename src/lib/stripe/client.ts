import Stripe from "stripe";

import { serverEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

/**
 * Lazily-created singleton Stripe server client. Server-only — never
 * import this from a Client Component.
 */
export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia",
    });
  }
  return stripeClient;
}
