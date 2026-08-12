import Link from "next/link";
import { ArrowRight, LineChart } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreHistoryChart } from "@/components/dashboard/score-history-chart";
import { ProgressionChart } from "@/components/dashboard/progression/progression-chart";
import { WeeklyStatsSection, type ThisWeekEntry } from "@/components/dashboard/progression/weekly-stats-section";
import type { DatingPlatform } from "@/types/database.types";

const SUB_SCORES = [
  { key: "photo_score", label: "Photos" },
  { key: "bio_score", label: "Bio" },
  { key: "conversation_score", label: "Conversation" },
  { key: "attractiveness_score", label: "Attractivité" },
] as const;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Monday of the current week — must match WeeklyStatsForm's own computation to detect "already logged this week". */
function currentWeekStart() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  return isoDate(monday);
}

export default async function ProgressionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: analyses }, { data: statsRows }] = await Promise.all([
    supabase
      .from("analyses")
      .select("overall_score, photo_score, bio_score, attractiveness_score, conversation_score, created_at")
      .eq("user_id", user?.id ?? "")
      .eq("is_simulated", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("dating_stats")
      .select("platform, period_start, period_end, likes, matches, conversations, replies, dates")
      .eq("user_id", user?.id ?? "")
      .order("period_end", { ascending: true }),
  ]);

  const realAnalyses = analyses ?? [];
  const stats = statsRows ?? [];

  if (realAnalyses.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ta progression</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Le suivi de ton Dating Score dans le temps, avec l&apos;effet de tes changements.
          </p>
        </div>
        <EmptyState
          icon={LineChart}
          title="Aucune analyse réelle pour le moment"
          description="Complète ton profil pour obtenir ton premier Dating Score — ta progression apparaîtra ici dès la deuxième analyse."
          action={
            <Button asChild>
              <Link href="/onboarding">
                Lancer mon analyse
                <ArrowRight />
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const first = realAnalyses[0];
  const latest = realAnalyses[realAnalyses.length - 1];
  const delta = latest.overall_score - first.overall_score;
  const firstDate = new Date(first.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" });

  const scorePoints = realAnalyses.map((a) => ({ date: a.created_at, score: a.overall_score }));

  // One bar per distinct week (period_end), summing matches across platforms logged for that week.
  const matchesByPeriodEnd = new Map<string, number>();
  for (const row of stats) {
    matchesByPeriodEnd.set(row.period_end, (matchesByPeriodEnd.get(row.period_end) ?? 0) + row.matches);
  }
  const statPoints = [...matchesByPeriodEnd.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weekStart = currentWeekStart();
  const thisWeek: ThisWeekEntry[] = stats
    .filter((row) => row.period_start === weekStart)
    .map((row) => ({
      platform: row.platform as DatingPlatform,
      matches: row.matches,
      likes: row.likes,
      conversations: row.conversations,
      replies: row.replies,
      dates: row.dates,
    }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ta progression</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Le suivi de ton Dating Score dans le temps, avec l&apos;effet de tes changements.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold tracking-tight">{latest.overall_score}/100</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {realAnalyses.length > 1 ? (
                  <>
                    <span className={delta >= 0 ? "font-medium text-primary" : "font-medium text-destructive"}>
                      {delta >= 0 ? "+" : ""}
                      {delta} point{Math.abs(delta) > 1 ? "s" : ""}
                    </span>{" "}
                    depuis le {firstDate}
                  </>
                ) : (
                  "Relance une analyse pour commencer à suivre ta progression."
                )}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/analyze">Relancer une analyse</Link>
            </Button>
          </div>

          <ProgressionChart scorePoints={scorePoints} statPoints={statPoints} statLabel="matchs" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {SUB_SCORES.map((sub) => {
          const points = realAnalyses.map((a) => ({ date: a.created_at, score: a[sub.key] ?? 0 }));
          const subDelta = realAnalyses.length > 1 ? points[points.length - 1].score - points[0].score : null;
          const currentScore = points[points.length - 1].score;
          return (
            <Card key={sub.key}>
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{sub.label}</CardTitle>
                    <span className="text-lg font-semibold tracking-tight">{currentScore}</span>
                  </div>
                  {subDelta !== null && (
                    <span className={`text-xs font-medium ${subDelta >= 0 ? "text-primary" : "text-destructive"}`}>
                      {subDelta >= 0 ? "+" : ""}
                      {subDelta} depuis le début
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScoreHistoryChart points={points} compact />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">Tes chiffres, semaine après semaine</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          C&apos;est ce qui donne du sens à la courbe ci-dessus — vois ce qui bouge vraiment sur tes applis.
        </p>
        <div className="mt-4">
          <WeeklyStatsSection initialThisWeek={thisWeek} />
        </div>
      </div>
    </div>
  );
}
