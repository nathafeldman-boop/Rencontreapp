"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeforeAfterSection } from "@/components/marketing/before-after";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const PLAN_ID = "premium_monthly";
const PRICE = "7.99€";

const BENEFITS = [
  "Full profile analysis",
  "Unlimited optimizations",
  "AI dating coach",
  "Conversation assistant",
  "Match improvement plan",
];

export default function PaywallPage() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    track(AnalyticsEvent.PaywallViewed, { trigger: "results" });
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    setNotice(null);
    track(AnalyticsEvent.CheckoutStarted, { plan: PLAN_ID });

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: PLAN_ID }),
    });

    if (res.ok) {
      // `subscription_purchased` fires server-side from the Stripe webhook
      // once payment is actually confirmed — see src/app/api/stripe/webhook.
      const { data } = await res.json();
      window.location.assign(data.url);
      return;
    }

    setLoading(false);
    setNotice("Checkout is launching very soon — come back in a few days!");
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
        <div className="text-center">
          <Badge variant="accent">Launch offer</Badge>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Unlock your full dating potential.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stop guessing what&apos;s not working. Join MatchAI Premium.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 rounded-2xl border border-primary/40 bg-card p-6 shadow-lg shadow-primary/10"
        >
          <p>
            <span className="text-3xl font-semibold">{PRICE}</span>
            <span className="text-sm text-muted-foreground"> / month</span>
          </p>

          <ul className="mt-5 flex flex-col gap-2.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {benefit}
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" size="lg" disabled={loading} onClick={handleSubscribe}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Unlock My Full Analysis
          </Button>

          {notice && <p className="mt-3 text-center text-xs text-muted-foreground">{notice}</p>}
        </motion.div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Cancel anytime. No commitment.
        </p>
      </div>

      <BeforeAfterSection />
    </main>
  );
}
