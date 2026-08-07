"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const DEMO_SCORES = {
  overall: 62,
  photo: 58,
  bio: 71,
  conversation: 55,
};

const VISIBLE_RECOMMENDATION = {
  category: "Photos",
  title: "Ta photo de profil manque de contexte social",
  detail:
    "Les profils avec au moins une photo en situation (voyage, sport, sortie entre amis) obtiennent en moyenne 35 % de matchs en plus.",
};

const LOCKED_RECOMMENDATIONS = [
  "2 recommandations sur ta bio",
  "3 recommandations sur tes photos",
  "2 ouvertures de conversation prêtes à l'emploi",
];

export function ResultsView() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  useEffect(() => {
    track(AnalyticsEvent.AnalysisCompleted, { overall_score: DEMO_SCORES.overall });
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12">
      {isDemo && (
        <p className="mb-6 rounded-lg bg-secondary px-4 py-2 text-center text-xs text-muted-foreground">
          Aperçu de démonstration — l&apos;analyse IA complète arrive dans une prochaine étape.
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative flex size-32 items-center justify-center rounded-full bg-brand-gradient text-4xl font-semibold text-primary-foreground">
          {DEMO_SCORES.overall}
        </div>
        <h1 className="mt-4 text-xl font-semibold">Ton score de profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Il y a une marge de progression claire — voici où.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-4">
        <ScoreRow label="Photos" value={DEMO_SCORES.photo} />
        <ScoreRow label="Bio" value={DEMO_SCORES.bio} />
        <ScoreRow label="Conversation" value={DEMO_SCORES.conversation} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">{VISIBLE_RECOMMENDATION.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{VISIBLE_RECOMMENDATION.detail}</p>
        </CardContent>
      </Card>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-border">
        <ul className="flex flex-col divide-y divide-border blur-sm select-none">
          {LOCKED_RECOMMENDATIONS.map((label) => (
            <li key={label} className="p-4 text-sm">
              {label}
            </li>
          ))}
        </ul>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70">
          <Lock className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">7 recommandations supplémentaires</p>
        </div>
      </div>

      <Button size="lg" className="mt-8 w-full" asChild>
        <Link href="/paywall">
          Débloquer mon analyse complète
          <ArrowRight />
        </Link>
      </Button>
    </main>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/100</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
