"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const PLAN_ID = "premium_monthly";

/** Same checkout flow as /paywall, reused here so the comparison page can convert directly. */
export function UpgradeCta({ hasBillingAccount }: { hasBillingAccount: boolean }) {
  const { loading, error, redirect } = useStripeRedirect();

  async function go() {
    if (hasBillingAccount) {
      await redirect("/api/stripe/portal", { errorMessage: "Couldn't open billing — try again in a moment." });
      return;
    }

    track(AnalyticsEvent.CheckoutStarted, { plan: PLAN_ID });
    await redirect("/api/stripe/checkout", {
      body: { plan: PLAN_ID },
      errorMessage: "Couldn't start checkout — try again in a moment.",
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button size="lg" className="w-full" disabled={loading} onClick={go}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        {hasBillingAccount ? "Manage billing" : "Unlock Premium — 7.99€/month"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
