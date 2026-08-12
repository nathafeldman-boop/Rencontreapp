"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Info, MessageCircle, Sparkles, Swords, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScoreReveal } from "@/components/results/score-reveal";
import { ShareScoreCard } from "@/components/dashboard/share-score-card";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { themedDatingApp } from "@/lib/theme/dating-app-theme";
import type { DatingApp, Recommendation } from "@/types/database.types";

export interface ResultsData {
  id?: string;
  overall: number;
  photo: number;
  bio: number;
  attractiveness: number;
  conversation: number;
  freeInsights: string[];
  recommendations: Recommendation[];
  isDemo: boolean;
  isSimulated: boolean;
  biggestProblem?: string;
  datingApp?: DatingApp | null;
}

const SUB_SCORE_LABELS = { photo: "Photos", bio: "Bio", attractiveness: "Attractivité", conversation: "Conversation" };

const CATEGORY_LABELS: Record<Recommendation["category"], string> = {
  photos: "Photos",
  bio: "Bio",
  conversation: "Conversation",
};

const PREMIUM_TOOLS = [
  { icon: Sparkles, label: "Bio Generator", detail: "Des bios prêtes à coller, dans ton style." },
  { icon: MessageCircle, label: "Coach de conversation", detail: "La bonne réponse pour chaque conversation." },
  { icon: Swords, label: "Simulateur de match", detail: "Entraîne-toi avant que ça compte pour de vrai." },
  { icon: TrendingUp, label: "Suivi de progression", detail: "Vois si tes changements font vraiment effet." },
];

export function ResultsView({ data }: { data: ResultsData }) {
  useEffect(() => {
    track(AnalyticsEvent.AnalysisCompleted, { overall_score: data.overall, is_simulated: data.isSimulated });
  }, [data.overall, data.isSimulated]);

  const subScores = {
    photo: data.photo,
    bio: data.bio,
    attractiveness: data.attractiveness,
    conversation: data.conversation,
  };
  const weakestKey = (Object.keys(subScores) as (keyof typeof subScores)[]).sort(
    (a, b) => subScores[a] - subScores[b]
  )[0];

  return (
    <main
      className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12"
      data-dating-app={themedDatingApp(data.datingApp)}
    >
      {data.isDemo && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            <span className="font-medium">Exemple générique, pas ton résultat.</span> Envoie ton profil pour
            obtenir ton vrai score — les chiffres ci-dessous ne parlent pas de toi.
          </p>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <ScoreReveal value={data.overall} />

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-5 text-xl font-semibold"
        >
          Ton profil obtient {data.overall}/100
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="mt-1 text-sm text-muted-foreground"
        >
          {data.biggestProblem
            ? `Tu nous as dit que "${data.biggestProblem}" est ta plus grosse difficulté — voici exactement pourquoi.`
            : `Voici exactement pourquoi tu n'as pas plus de matchs.`}
        </motion.p>

        {!data.isDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.4 }} className="mt-4">
            <ShareScoreCard overallScore={data.overall} photoScore={data.photo} bioScore={data.bio} conversationScore={data.conversation} />
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="mt-8 flex flex-col gap-4"
      >
        {(Object.keys(subScores) as (keyof typeof subScores)[]).map((key) => (
          <ScoreRow key={key} label={SUB_SCORE_LABELS[key]} value={subScores[key]} isWeakest={key === weakestKey} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mt-8 flex flex-col gap-3"
      >
        {data.freeInsights.map((insight, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Conseil gratuit</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2">
              <p className="text-sm">{insight}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Full breakdown — nothing held back, every recommendation from the analysis. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="mt-8"
      >
        <h2 className="text-lg font-semibold tracking-tight">Ce qu&apos;il faut changer, en détail</h2>
        <div className="mt-3 flex flex-col gap-3">
          {data.recommendations.map((rec, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {CATEGORY_LABELS[rec.category]}
                  </Badge>
                  <CardTitle className="text-sm">{rec.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="-mt-2">
                <p className="text-sm text-muted-foreground">{rec.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Premium pitch: not "unlock this analysis" (it's already fully shown above) — it's about
          acting on it fast, training, and knowing whether the changes actually worked. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.4 }}
        className="mt-10"
      >
        <div className="rounded-2xl border border-primary/30 bg-accent/30 p-5">
          <p className="text-sm font-medium">Tu sais maintenant quoi changer. On peut t&apos;aider à le faire plus vite.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Premium te donne les outils pour appliquer ces changements en quelques minutes, t&apos;entraîner avant
            tes vrais rendez-vous, et suivre si ça marche vraiment.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {PREMIUM_TOOLS.map((tool) => (
              <div key={tool.label} className="flex items-start gap-2">
                <tool.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium">{tool.label}</p>
                  <p className="text-[11px] text-muted-foreground">{tool.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" className="mt-6 w-full" asChild>
          <Link href={data.id ? `/paywall?id=${data.id}` : "/paywall"}>
            Passer à l&apos;action avec mon coach
            <ArrowRight />
          </Link>
        </Button>
      </motion.div>

      {!data.isDemo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.4 }} className="mt-6">
          <FeedbackWidget context="results" />
        </motion.div>
      )}
    </main>
  );
}

function ScoreRow({ label, value, isWeakest }: { label: string; value: number; isWeakest: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {label}
          {isWeakest && (
            <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              Plus grosse opportunité
            </span>
          )}
        </span>
        <span className="font-medium">{value}/100</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
