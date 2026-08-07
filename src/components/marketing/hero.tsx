"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/marketing/animated-counter";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { useLandingVariant } from "@/lib/experiments/use-landing-variant";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Hero() {
  const { variant, copy } = useLandingVariant();

  useEffect(() => {
    track(AnalyticsEvent.LandingView, { source: document.referrer || undefined, variant });
  }, [variant]);

  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
      >
        <div className="h-[420px] w-[420px] rounded-full bg-brand-gradient opacity-20" />
      </div>

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.5 }}>
          <Badge variant="accent" className="mb-6">
            {copy.badge}
          </Badge>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          {copy.headlineBefore}
          <span className="text-brand-gradient">{copy.headlineHighlight}</span>
          {copy.headlineAfter}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 text-balance text-lg text-muted-foreground"
        >
          {copy.subheadline}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-8"
        >
          <Button
            size="lg"
            asChild
            onClick={() => track(AnalyticsEvent.ClickStartAnalysis, { cta_location: "hero", variant })}
          >
            <Link href="/auth/login">
              {copy.ctaLabel}
              <ArrowRight />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
            <span className="ml-1.5 text-sm font-medium text-foreground">4.8/5</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              <AnimatedCounter />
            </span>{" "}
            profils analysés, et ça continue
          </p>
        </motion.div>
      </div>
    </section>
  );
}
