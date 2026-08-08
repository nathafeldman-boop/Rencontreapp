"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const FREE_FEATURES = ["Dating Score en moins d'une minute", "2 conseils personnalisés gratuits", "Aucune carte bancaire requise"];

const PREMIUM_FEATURES = [
  "Analyse complète : photos, bio, attractivité, conversation",
  "Photo Optimizer & Bio Generator illimités",
  "Coach de conversation IA (4 modes)",
  "Simulateur de match & plan d'amélioration personnalisé",
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Paiement sécurisé via Stripe" },
  { icon: RotateCcw, label: "Annulation en un clic" },
  { icon: Lock, label: "Données privées" },
];

export function Pricing() {
  return (
    <section className="border-t border-border bg-secondary/30 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Un tarif simple, sans surprise
        </motion.h2>
        <p className="mt-3 text-muted-foreground">
          Commence gratuitement. Passe Premium seulement si ça vaut vraiment le coup pour toi.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
          className="flex flex-col rounded-2xl border border-border bg-card p-6"
        >
          <p className="text-sm font-medium text-muted-foreground">Gratuit</p>
          <p className="mt-2 text-3xl font-semibold">0€</p>
          <ul className="mt-5 flex flex-1 flex-col gap-2.5">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-6 w-full"
            asChild
            onClick={() => track(AnalyticsEvent.ClickStartAnalysis, { cta_location: "pricing_free" })}
          >
            <Link href="/auth/login">Analyser mon profil</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-6 shadow-lg shadow-primary/10"
        >
          <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2">
            Le plus populaire
          </Badge>
          <p className="text-sm font-medium text-primary">Premium</p>
          <p className="mt-2 text-3xl font-semibold">
            7,99€<span className="text-sm font-normal text-muted-foreground"> / mois</span>
          </p>
          <ul className="mt-5 flex flex-1 flex-col gap-2.5">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="mt-6 w-full"
            asChild
            onClick={() => track(AnalyticsEvent.ClickStartAnalysis, { cta_location: "pricing_premium" })}
          >
            <Link href="/auth/login">Commencer</Link>
          </Button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">Débloqué juste après ton analyse gratuite.</p>
        </motion.div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {TRUST_BADGES.map((badge) => (
          <span key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <badge.icon className="size-3.5" />
            {badge.label}
          </span>
        ))}
      </div>
    </section>
  );
}
