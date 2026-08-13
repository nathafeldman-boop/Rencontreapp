"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
      {/* The hook's backdrop — a real sky, not a faked gradient */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-30">
        <Image
          src="/marketing/hero-sky.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_20%]"
        />
      </div>

      {/* Legibility scrim — opaque over the text column, letting the sky show through at the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(65% 78% at 50% 35%, oklch(0.99 0 0 / 0.95) 0%, oklch(0.99 0 0 / 0.88) 45%, oklch(0.99 0 0 / 0.6) 75%, oklch(0.99 0 0 / 0.3) 100%)",
        }}
      />

      {/* Grain — static, ~2.5% opacity, breaks up the "perfect digital surface" look */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_URI}")` }}
      />

      {/* Bottom fade — melts the photo into the page background instead of a hard crop line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-background sm:h-40"
      />

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45 }}
          className="text-balance text-3xl leading-[1.15] font-semibold tracking-tight min-[390px]:text-4xl sm:text-5xl"
        >
          Ton profil te fait-il <span className="text-brand-gradient">perdre des matchs</span> ?
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-4 text-balance text-lg text-muted-foreground"
        >
          FlirtCraft analyse tes photos, ta bio et ton profil avec ton coach pour identifier ce qui peut te faire
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
