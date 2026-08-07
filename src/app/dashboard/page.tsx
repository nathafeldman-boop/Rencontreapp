import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Gift,
  MessageCircle,
  Sparkles,
  Swords,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SubScoreCard } from "@/components/dashboard/sub-score-card";
import { ScoreHistoryChart } from "@/components/dashboard/score-history-chart";
import { ViewTracker } from "@/components/dashboard/view-tracker";
import { ShareScoreCard } from "@/components/dashboard/share-score-card";
import { WeeklyReportCard } from "@/components/dashboard/weekly-report-card";
import { ComeBackBanner } from "@/components/dashboard/come-back-banner";
import { computeBadges, getLevel, nextLevel } from "@/lib/gamification/badges";
import { getWeeklyReport } from "@/lib/reports/weekly-report";
import { getDisplayFirstName } from "@/lib/utils/display-name";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { Recommendation } from "@/types/database.types";

const OBJECTIVE_QUESTION = "What's your main objective?";

const TOOLS = [
  { href: "/dashboard/photos", icon: Camera, label: "Photo Optimizer" },
  { href: "/dashboard/bio", icon: Sparkles, label: "Bio Generator" },
  { href: "/dashboard/coach", icon: MessageCircle, label: "Coach de conversation" },
  { href: "/dashboard/simulator", icon: Swords, label: "Simulateur de match" },
  { href: "/dashboard/plan", icon: CalendarCheck, label: "Mon plan d'amélioration" },
  { href: "/referrals", icon: Gift, label: "Inviter des amis" },
];

function findRecommendation(recommendations: Recommendation[], category: Recommendation["category"]) {
  return recommendations.find((r) => r.category === category)?.detail;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select(
      "overall_score, photo_score, bio_score, attractiveness_score, conversation_score, recommendations, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const [{ data: plan }, { count: bioGenerationCount }, { count: simulatorSessionCount }, weeklyReport, { data: objectiveAnswer }] =
    await Promise.all([
      supabase.from("dating_plans").select("days").eq("user_id", user?.id ?? "").maybeSingle(),
      supabase.from("bio_generations").select("*", { count: "exact", head: true }).eq("user_id", user?.id ?? ""),
      supabase
        .from("match_simulator_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id ?? "")
        .not("ended_at", "is", null),
      getWeeklyReport(supabase, user?.id ?? ""),
      supabase
        .from("onboarding_answers")
        .select("answer")
        .eq("user_id", user?.id ?? "")
        .eq("question", OBJECTIVE_QUESTION)
        .maybeSingle(),
    ]);

  const firstName = getDisplayFirstName(user);

  if (!analyses || analyses.length === 0) {
    return (
      <div className="py-8">
        <ViewTracker event={AnalyticsEvent.DashboardViewed} properties={{ has_active_plan: true }} />
        <EmptyState
          icon={Sparkles}
          title="Aucune analyse pour le moment"
          description="Complète l'envoi de ton profil pour obtenir ton premier Dating Score."
          action={
            <Button asChild>
              <Link href="/onboarding">Lancer mon analyse</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const [latest, previous] = analyses;
  const recommendations = (latest.recommendations ?? []) as Recommendation[];
  const delta = previous ? latest.overall_score - previous.overall_score : null;

  const history = [...analyses]
    .reverse()
    .map((a) => ({ date: a.created_at, score: a.overall_score }));

  const planProgress = plan?.days ? plan.days.filter((d) => d.done).length : 0;

  const badges = computeBadges({
    overallScore: latest.overall_score,
    photoScore: latest.photo_score ?? 0,
    conversationScore: latest.conversation_score ?? 0,
    scoreDelta: delta,
    planDaysDone: planProgress,
    planDaysTotal: plan?.days.length ?? 0,
    bioGenerationCount: bioGenerationCount ?? 0,
    simulatorSessionCount: simulatorSessionCount ?? 0,
  });

  const level = getLevel(latest.overall_score);
  const upNext = nextLevel(latest.overall_score);

  return (
    <div className="flex flex-col gap-8">
      <ViewTracker event={AnalyticsEvent.DashboardViewed} properties={{ has_active_plan: true }} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Salut ${firstName} 👋` : "Ton tableau de bord"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {objectiveAnswer?.answer
            ? `L'avis de ton coach sur ton profil — objectif : "${objectiveAnswer.answer}".`
            : "L'avis de ton coach sur ton profil, mis à jour en direct."}
        </p>
      </div>

      {weeklyReport && <ComeBackBanner daysSinceLastAnalysis={weeklyReport.daysSinceLastAnalysis} />}

      <Card className="overflow-hidden border-primary/30">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            🔥 Dating Score
          </span>
          <div className="flex size-32 items-center justify-center rounded-full bg-brand-gradient text-4xl font-semibold text-primary-foreground shadow-lg shadow-primary/20">
            {latest.overall_score}
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Badge variant="secondary">{level.name}</Badge>
            {upNext && (
              <p className="text-xs text-muted-foreground">
                {upNext.min - latest.overall_score} points avant {upNext.name}
              </p>
            )}
          </div>
          {delta !== null && (
            <Badge variant={delta >= 0 ? "default" : "secondary"} className="gap-1">
              {delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {delta >= 0 ? "+" : ""}
              {delta} points depuis la dernière analyse
            </Badge>
          )}
          <ShareScoreCard
            overallScore={latest.overall_score}
            photoScore={latest.photo_score ?? undefined}
            bioScore={latest.bio_score ?? undefined}
            conversationScore={latest.conversation_score ?? undefined}
          />
        </CardContent>
      </Card>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge.key}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium"
            >
              <span>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <SubScoreCard
          label="Score Photos"
          score={latest.photo_score ?? 0}
          recommendation={findRecommendation(recommendations, "photos")}
          improveHref="/dashboard/photos"
        />
        <SubScoreCard
          label="Score Bio"
          score={latest.bio_score ?? 0}
          recommendation={findRecommendation(recommendations, "bio")}
          improveHref="/dashboard/bio"
        />
        <SubScoreCard
          label="Score Attractivité"
          score={latest.attractiveness_score ?? 0}
          improveHref="/dashboard/photos"
        />
        <SubScoreCard
          label="Score Conversation"
          score={latest.conversation_score ?? 0}
          recommendation={findRecommendation(recommendations, "conversation")}
          improveHref="/dashboard/coach"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression dans le temps</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreHistoryChart points={history} />
        </CardContent>
      </Card>

      {weeklyReport && <WeeklyReportCard report={weeklyReport} />}

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Ton coach, à la demande</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Button key={tool.href} variant="outline" className="h-auto justify-between py-4" asChild>
              <Link href={tool.href}>
                <span className="flex items-center gap-2">
                  <tool.icon className="size-4" />
                  {tool.label}
                </span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
