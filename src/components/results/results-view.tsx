"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScoreReveal } from "@/components/results/score-reveal";
import { ShareScoreCard } from "@/components/dashboard/share-score-card";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

export interface ResultsData {
  overall: number;
  photo: number;
  bio: number;
  attractiveness: number;
  conversation: number;
  freeInsights: string[];
  lockedCount: number;
  isDemo: boolean;
  isSimulated: boolean;
  biggestProblem?: string;
}

const SUB_SCORE_LABELS = { photo: "Photos", bio: "Bio", attractiveness: "Attractiveness", conversation: "Conversation" };

const LOCKED_TEASERS = [
  "Your #1 photo swap — exactly which one to lead with, and why it matters most",
  "3 full bio rewrites tailored to your goal, ready to paste in",
  "5 ready-to-send openers picked for your weakest conversations",
  "The one detail sabotaging your first impression right now",
  "A 7-day action plan ordered by biggest impact first",
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
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12">
      {data.isDemo && (
        <p className="mb-6 rounded-lg bg-secondary px-4 py-2 text-center text-xs text-muted-foreground">
          Demo preview — sign in and complete onboarding for your real score.
        </p>
      )}

      <div className="flex flex-col items-center text-center">
        <ScoreReveal value={data.overall} />

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-5 text-xl font-semibold"
        >
          Your profile scores {data.overall}/100
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="mt-1 text-sm text-muted-foreground"
        >
          {data.biggestProblem
            ? `You told us "${data.biggestProblem}" is your biggest struggle — here's exactly why.`
            : `Here's exactly why you're not getting more matches.`}
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Free insight</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2">
              <p className="text-sm">{insight}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.4 }}
      >
        <p className="mt-8 text-sm font-medium">
          What Premium unlocks — this is what&apos;s actually holding you back.
        </p>

        <div className="mt-3 flex flex-col gap-3">
          {data.lockedCount > 0 && (
            <div className="rounded-xl border border-primary/30 bg-accent/50 p-4">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Sneak peek</span>
              <p className="mt-1 text-sm text-accent-foreground">{LOCKED_TEASERS[0]}</p>
            </div>
          )}

          {data.lockedCount > 1 && (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <ul aria-hidden="true" className="flex flex-col divide-y divide-border blur-sm select-none">
                {Array.from({ length: data.lockedCount - 1 }).map((_, i) => (
                  <li key={i} className="p-4 text-sm">
                    {LOCKED_TEASERS[(i + 1) % LOCKED_TEASERS.length]}
                  </li>
                ))}
              </ul>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70">
                <Lock className="size-5 text-muted-foreground" />
                <p className="text-sm font-medium">{data.lockedCount - 1} more personalized recommendations</p>
              </div>
            </div>
          )}
        </div>

        <Button size="lg" className="mt-8 w-full" asChild>
          <Link href="/paywall">
            Unlock My Full Analysis
            <ArrowRight />
          </Link>
        </Button>
      </motion.div>

      {!data.isDemo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.4 }} className="mt-6">
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
              Biggest opportunity
            </span>
          )}
        </span>
        <span className="font-medium">{value}/100</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
