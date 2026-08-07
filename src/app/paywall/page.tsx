"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Check, Loader2, Lock, RotateCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

// Below-the-fold social proof/FAQ — deferred so the above-the-fold offer
// and its checkout button aren't waiting on this JS to download.
const BeforeAfterSection = dynamic(() => import("@/components/marketing/before-after").then((m) => m.BeforeAfterSection));
const Testimonials = dynamic(() => import("@/components/marketing/testimonials").then((m) => m.Testimonials));
const FaqAccordion = dynamic(() => import("@/components/marketing/faq-accordion").then((m) => m.FaqAccordion));

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Paiement sécurisé via Stripe" },
  { icon: RotateCcw, label: "Annulation en un clic, à tout moment" },
  { icon: Lock, label: "Tes données restent privées" },
];

const PLAN_ID = "premium_monthly";
const PRICE = "7,99€";

const BENEFITS = [
  "Analyse complète du profil",
  "Optimisations illimitées",
  "Coach de rencontre IA",
  "Assistant de conversation",
  "Plan d'amélioration personnalisé",
];

export default function PaywallPage() {
  const { loading, error, redirect } = useStripeRedirect();

  useEffect(() => {
    track(AnalyticsEvent.PaywallViewed, { trigger: "results" });
  }, []);

  async function handleSubscribe() {
    track(AnalyticsEvent.CheckoutStarted, { plan: PLAN_ID });
    // `subscription_purchased` fires server-side from the Stripe webhook
    // once payment is actually confirmed — see src/app/api/stripe/webhook.
    await redirect("/api/stripe/checkout", {
      body: { plan: PLAN_ID },
      errorMessage: "Le paiement arrive très bientôt — reviens dans quelques jours !",
    });
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-col px-6 py-16">
        <div className="text-center">
          <Badge variant="accent">Offre de lancement</Badge>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Débloque tout ton potentiel sur les apps de rencontre.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Arrête de deviner ce qui ne marche pas. Rejoins MatchAI Premium.
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
            <span className="text-sm text-muted-foreground"> / mois</span>
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
            Débloquer mon analyse complète
          </Button>

          {error && <p className="mt-3 text-center text-xs text-muted-foreground">{error}</p>}
        </motion.div>

        <div className="mt-5 flex flex-col items-center gap-2">
          {TRUST_BADGES.map((badge) => (
            <span key={badge.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <badge.icon className="size-3.5" />
              {badge.label}
            </span>
          ))}
        </div>

        <Link
          href="/premium"
          className="mt-4 text-center text-xs text-primary underline underline-offset-2"
        >
          Voir le comparatif complet Gratuit vs Premium
        </Link>
      </div>

      <BeforeAfterSection />
      <Testimonials />
      <FaqAccordion />
    </main>
  );
}
