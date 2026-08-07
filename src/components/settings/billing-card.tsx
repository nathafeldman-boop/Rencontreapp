"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database.types";

interface BillingCardProps {
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
  hasBillingAccount: boolean;
}

const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  free: "No active subscription",
  premium_monthly: "Premium — 7.99€/month",
  premium_annual: "Premium — annual",
};

export function BillingCard({ plan, status, currentPeriodEnd, hasBillingAccount }: BillingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isActive = status === "active" || status === "trialing";

  async function openPortal() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    if (res.ok) {
      const { data } = await res.json();
      window.location.assign(data.url);
      return;
    }
    setLoading(false);
    setError("Couldn't open billing — try again in a moment.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscription</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{PLAN_LABEL[plan ?? "free"]}</p>
          <Badge variant={isActive ? "default" : "secondary"}>{status ?? "free"}</Badge>
        </div>

        {currentPeriodEnd && (
          <p className="text-xs text-muted-foreground">
            {status === "canceled" ? "Access ends" : "Renews"} on{" "}
            {new Date(currentPeriodEnd).toLocaleDateString("en-US", { dateStyle: "medium" })}
          </p>
        )}

        {hasBillingAccount ? (
          <Button variant="outline" onClick={openPortal} disabled={loading} className="w-fit">
            {loading ? <Loader2 className="animate-spin" /> : null}
            Manage billing
          </Button>
        ) : (
          <Button asChild className="w-fit">
            <Link href="/paywall">Upgrade to Premium</Link>
          </Button>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
