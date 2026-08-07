"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { useLandingVariant } from "@/lib/experiments/use-landing-variant";

export function FinalCta() {
  const { variant, copy } = useLandingVariant();

  return (
    <section className="px-6 py-24 text-center">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Ready to see what&apos;s holding your matches back?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Free analysis. No credit card. Results in under a minute.
      </p>
      <div className="mt-8">
        <Button
          size="lg"
          asChild
          onClick={() => track(AnalyticsEvent.ClickStartAnalysis, { cta_location: "footer", variant })}
        >
          <Link href="/auth/login">
            {copy.ctaLabel}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
