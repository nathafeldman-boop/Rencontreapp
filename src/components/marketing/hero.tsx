"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/marketing/animated-counter";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { useLandingVariant } from "@/lib/experiments/use-landing-variant";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

// Barely-there grain so the background reads as a physical surface rather
// than a flat digital gradient — static (no animation cost), extremely low
// opacity, tiled small so it never looks like a filter.
const GRAIN_URI =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Hero() {
  // Headline/CTA copy below is now fixed (not sourced from the A/B variant)
  // per the redesigned hook — `variant` is kept only to tag analytics so
  // existing experiment reporting doesn't break.
  const { variant } = useLandingVariant();

  useEffect(() => {
    track(AnalyticsEvent.LandingView, { source: document.referrer || undefined, variant });
  }, [variant]);

  return (
    <section className="relative isolate overflow-hidden px-6 pt-20 pb-16 sm:pt-28">
      {/* Base wash — a static, extremely soft tint, not pure white */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,oklch(0.965_0.015_320)_0%,oklch(0.99_0_0)_60%)]"
      />

      {/* Ambient drifting light — soft, edgeless, no visible shapes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="animate-hero-drift-1 absolute -top-16 right-[6%] size-[380px] rounded-full sm:size-[560px]"
          style={{
            background: "radial-gradient(circle, oklch(0.86 0.09 15 / 0.55) 0%, oklch(0.86 0.09 15 / 0) 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="animate-hero-drift-2 absolute -bottom-24 -left-10 size-[340px] rounded-full sm:size-[520px]"
          style={{
            background: "radial-gradient(circle, oklch(0.85 0.07 320 / 0.5) 0%, oklch(0.85 0.07 320 / 0) 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Extra depth layer — desktop only, keeps mobile lighter/cheaper */}
        <div
          className="animate-hero-drift-3 absolute top-1/3 left-1/2 hidden size-[480px] -translate-x-1/2 rounded-full sm:block"
          style={{
            background: "radial-gradient(circle, oklch(0.9 0.05 350 / 0.4) 0%, oklch(0.9 0.05 350 / 0) 72%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* Grain — static, ~2.5% opacity, breaks up the "perfect digital surface" look */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.45 }}>
          <Badge variant="accent" className="mb-6">
            Analyse IA gratuite en 60 secondes
          </Badge>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="text-balance text-4xl leading-[1.15] font-semibold tracking-tight sm:text-5xl"
        >
          <span className="block">Tu n&apos;as peut-être pas un problème de matchs.</span>
          <span className="mt-1 block">
            Tu as peut-être un <span className="text-brand-gradient">problème de profil</span>.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-5 text-balance text-lg text-muted-foreground"
        >
          FlirtCraft analyse tes photos, ta bio et ton profil avec l&apos;IA pour identifier ce qui peut te faire
          perdre des matchs — et te montre exactement quoi améliorer.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-8"
        >
          <Button
            size="lg"
            asChild
            onClick={() => track(AnalyticsEvent.ClickStartAnalysis, { cta_location: "hero" })}
          >
            <Link href="/auth/login">
              Analyser mon profil gratuitement
              <ArrowRight />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-8"
        >
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
