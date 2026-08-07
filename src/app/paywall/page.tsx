"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const PLANS = [
  {
    id: "premium_monthly" as const,
    name: "Mensuel",
    price: "19,99 €",
    period: "/ mois",
  },
  {
    id: "premium_annual" as const,
    name: "Annuel",
    price: "9,99 €",
    period: "/ mois",
    badge: "-50%",
    highlighted: true,
  },
];

const BENEFITS = [
  "Analyse complète de tes photos, bio et conversations",
  "Recommandations personnalisées illimitées",
  "Suivi de ta progression dans le temps",
  "Nouvelles analyses à chaque mise à jour de profil",
];

export default function PaywallPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    track(AnalyticsEvent.PaywallViewed, { trigger: "results" });
  }, []);

  async function handleSubscribe(planId: string) {
    setLoadingPlan(planId);
    setNotice(null);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });

    if (res.ok) {
      // `subscription_purchased` fires server-side from the Stripe webhook
      // once payment is actually confirmed — see src/app/api/stripe/webhook.
      const { data } = await res.json();
      window.location.assign(data.url);
      return;
    }

    setLoadingPlan(null);
    setNotice("Le paiement arrive très bientôt — reviens dans quelques jours !");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-16">
      <div className="text-center">
        <Badge variant="accent">Offre de lancement</Badge>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Débloque ton analyse complète
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Rejoins MatchAI Premium et arrête de deviner ce qui ne va pas.
        </p>
      </div>

      <ul className="mt-8 flex flex-col gap-2.5">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {benefit}
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <Card className={plan.highlighted ? "border-primary shadow-lg shadow-primary/10" : ""}>
              <CardHeader>
                {plan.badge && <Badge className="w-fit">{plan.badge}</Badge>}
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <p>
                  <span className="text-2xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "secondary"}
                  disabled={loadingPlan !== null}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loadingPlan === plan.id ? <Loader2 className="animate-spin" /> : null}
                  Choisir
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {notice && <p className="mt-4 text-center text-sm text-muted-foreground">{notice}</p>}
    </main>
  );
}
