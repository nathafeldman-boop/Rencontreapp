"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreReveal } from "@/components/results/score-reveal";
import { DashboardDemo } from "@/components/paywall/dashboard-demo";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";
import { themedDatingApp } from "@/lib/theme/dating-app-theme";
import type { DatingApp } from "@/types/database.types";

export interface PaywallData {
  isDemo: boolean;
  firstName: string | null;
  overall: number;
  datingApp?: DatingApp | null;
}

const PLAN_ID = "premium_monthly";
const PRICE = "7,99€";

function scoreHeadline(overall: number): string {
  if (overall < 50) return "Tu sais maintenant précisément quoi changer. Premium t'aide à le faire vite et à t'entraîner avant que ça compte.";
  if (overall < 75) return "Tu as ta feuille de route. Premium t'aide à l'appliquer beaucoup plus vite, et à suivre si ça marche vraiment.";
  return "Ton profil est déjà solide. Premium t'aide à peaufiner les détails et à t'entraîner pour les conversations qui suivent.";
}

function potentialLabel(overall: number): string {
  if (overall < 50) return "Belle marge de progression";
  if (overall < 75) return "Marge de progression";
  return "Détails à peaufiner";
}

export function PaywallView({ data }: { data: PaywallData }) {
  const { loading, error, redirect } = useStripeRedirect();
  const [showSticky, setShowSticky] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track(AnalyticsEvent.PaywallViewed, { trigger: "results" });
  }, []);

  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
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
    <main className="flex flex-1 flex-col pb-24 sm:pb-0" data-dating-app={themedDatingApp(data.datingApp)}>
      {/* Hero: score, headline and primary CTA, all above the fold */}
      <section className="px-6 pt-10 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Badge variant="accent">{data.isDemo ? "Aperçu de démo" : "Ton analyse est prête"}</Badge>
        </motion.div>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mt-6 flex flex-col items-center gap-2.5"
        >
          <ScoreReveal value={data.overall} />
          <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {potentialLabel(data.overall)}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mt-7 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {data.firstName ? `${data.firstName}, passe à l'action.` : "Tu sais quoi changer. Passe à l'action."}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground"
        >
          {scoreHeadline(data.overall)}
        </motion.p>

        <motion.div
          ref={heroCtaRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          className="mx-auto mt-7 flex max-w-sm flex-col items-center gap-2"
        >
          <Button size="lg" className="w-full" disabled={loading} onClick={handleSubscribe}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Passer à l&apos;action avec mon coach
            <ArrowRight />
          </Button>
          <p className="text-xs text-muted-foreground">{PRICE} / mois · Sans engagement</p>
          {error && <p className="text-xs text-muted-foreground">{error}</p>}

          <Link
            href="/premium"
            className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Voir le comparatif Gratuit vs Premium
          </Link>
        </motion.div>
      </section>

      <DashboardDemo />

      <StickyMobileCta visible={showSticky} loading={loading} onClick={handleSubscribe} />
    </main>
  );
}

function StickyMobileCta({
  visible,
  loading,
  onClick,
}: {
  visible: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur transition-transform duration-300 sm:hidden",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Button size="lg" className="w-full" disabled={loading} onClick={onClick}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        Devenir Premium — {PRICE}/mois
      </Button>
    </div>
  );
}
