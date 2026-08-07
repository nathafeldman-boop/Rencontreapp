import { serverEnv } from "@/lib/env";
import type { SubscriptionPlan } from "@/types/database.types";

export interface PlanConfig {
  id: SubscriptionPlan;
  name: string;
  priceLabel: string;
  interval: "month" | "year";
  /** Resolved lazily so a missing optional price (e.g. annual) doesn't crash module load. */
  getPriceId: () => string | undefined;
}

/**
 * Single source of truth for sellable plans. Adding "annual" (already
 * modeled below) or a future "premium_plus" tier is a matter of adding a
 * config entry + a Stripe Price — no changes needed in the checkout or
 * webhook routes, which are plan-agnostic.
 */
export const PLANS: Record<string, PlanConfig> = {
  premium_monthly: {
    id: "premium_monthly",
    name: "Premium",
    priceLabel: "7.99€/month",
    interval: "month",
    getPriceId: () => serverEnv.STRIPE_PRICE_ID_MONTHLY,
  },
  premium_annual: {
    id: "premium_annual",
    name: "Premium (annual)",
    priceLabel: "annual",
    interval: "year",
    getPriceId: () => serverEnv.STRIPE_PRICE_ID_ANNUAL,
  },
};

export function getPlan(planId: string): PlanConfig | undefined {
  return PLANS[planId];
}

/** Reverse lookup used by the webhook, which only sees the Stripe Price ID. */
export function planIdFromPriceId(priceId: string | null | undefined): SubscriptionPlan {
  if (!priceId) return "free";
  const match = Object.values(PLANS).find((plan) => plan.getPriceId() === priceId);
  return match?.id ?? "free";
}
