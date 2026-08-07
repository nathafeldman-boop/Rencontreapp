"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const PLAN_ID = "premium_monthly";

/** Same checkout flow as /paywall, reused here so the comparison page can convert directly. */
export function UpgradeCta({ hasBillingAccount }: { hasBillingAccount: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);

    const endpoint = hasBillingAccount ? "/api/stripe/portal" : "/api/stripe/checkout";
    if (!hasBillingAccount) track(AnalyticsEvent.CheckoutStarted, { plan: PLAN_ID });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: hasBillingAccount ? undefined : JSON.stringify({ plan: PLAN_ID }),
    });

    if (res.ok) {
      const { data } = await res.json();
      window.location.assign(data.url);
      return;
    }

    setLoading(false);
    setError("Couldn't start checkout — try again in a moment.");
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
