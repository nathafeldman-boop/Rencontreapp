"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
}

export function ResultsView({ data }: { data: ResultsData }) {
  useEffect(() => {
    track(AnalyticsEvent.AnalysisCompleted, { overall_score: data.overall });
  }, [data.overall]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12">
      {data.isDemo && (
        <p className="mb-6 rounded-lg bg-secondary px-4 py-2 text-center text-xs text-muted-foreground">
          Demo preview — sign in and complete onboarding for your real score.
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center"
      >
        <div className="relative flex size-32 items-center justify-center rounded-full bg-brand-gradient text-4xl font-semibold text-primary-foreground">
          {data.overall}
        </div>
        <h1 className="mt-4 text-xl font-semibold">Your profile score: {data.overall}/100</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          There&apos;s clear room to grow — here&apos;s where.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-4">
        <ScoreRow label="Photos" value={data.photo} />
        <ScoreRow label="Bio" value={data.bio} />
        <ScoreRow label="Attractiveness" value={data.attractiveness} />
        <ScoreRow label="Conversation" value={data.conversation} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
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
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-border">
        <ul className="flex flex-col divide-y divide-border blur-sm select-none">
          {Array.from({ length: data.lockedCount }).map((_, i) => (
            <li key={i} className="p-4 text-sm">
              Recommendation #{i + 1} — full detail, new bio draft, and ready-to-send openers
            </li>
          ))}
        </ul>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70">
          <Lock className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">{data.lockedCount} personalized recommendations</p>
        </div>
      </div>

      <Button size="lg" className="mt-8 w-full" asChild>
        <Link href="/paywall">
          Unlock My Full Analysis
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
