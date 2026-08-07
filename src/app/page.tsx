"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, MessageCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const FEATURES = [
  {
    icon: Camera,
    title: "Analyse de photos",
    description: "L'IA identifie tes meilleures photos et celles qui te desservent.",
  },
  {
    icon: Sparkles,
    title: "Bio optimisée",
    description: "Des suggestions concrètes pour une bio qui donne envie de matcher.",
  },
  {
    icon: MessageCircle,
    title: "Conversations",
    description: "Des ouvertures de conversation qui obtiennent des réponses.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  useEffect(() => {
    track(AnalyticsEvent.LandingPageViewed, { source: document.referrer || undefined });
  }, []);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
        >
          <div className="h-[420px] w-[420px] rounded-full bg-brand-gradient opacity-20" />
        </div>

        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.5 }}>
            <Badge variant="accent" className="mb-6">
              Analyse gratuite en 60 secondes
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Obtiens plus de matchs grâce à une{" "}
            <span className="text-brand-gradient">analyse IA</span> de ton profil
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-balance text-lg text-muted-foreground"
          >
            MatchAI analyse tes photos, ta bio et tes conversations sur Tinder, Hinge et
            Bumble — puis te dit exactement quoi changer.
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
              onClick={() => track(AnalyticsEvent.CtaClicked, { cta_location: "hero" })}
            >
              <Link href="/auth/login">
                Analyser mon profil gratuitement
                <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30 px-6 py-20">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Prêt à voir ce qui bloque tes matchs ?
        </h2>
        <div className="mt-8">
          <Button
            size="lg"
            asChild
            onClick={() => track(AnalyticsEvent.CtaClicked, { cta_location: "footer" })}
          >
            <Link href="/auth/login">
              Commencer gratuitement
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
