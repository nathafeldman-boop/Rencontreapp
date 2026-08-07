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
import { SubScoreCard } from "@/components/dashboard/sub-score-card";
import { ScoreHistoryChart } from "@/components/dashboard/score-history-chart";
import { ViewTracker } from "@/components/dashboard/view-tracker";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { Recommendation } from "@/types/database.types";

const TOOLS = [
  { href: "/dashboard/photos", icon: Camera, label: "Photo Optimizer" },
  { href: "/dashboard/bio", icon: Sparkles, label: "Bio Generator" },
  { href: "/dashboard/coach", icon: MessageCircle, label: "Conversation Coach" },
  { href: "/dashboard/simulator", icon: Swords, label: "Match Simulator" },
  { href: "/dashboard/plan", icon: CalendarCheck, label: "My Improvement Plan" },
  { href: "/referrals", icon: Gift, label: "Invite Friends" },
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

  const { data: plan } = await supabase.from("dating_plans").select("days").eq("user_id", user?.id ?? "").maybeSingle();

  if (!analyses || analyses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <ViewTracker event={AnalyticsEvent.DashboardViewed} properties={{ has_active_plan: true }} />
        <h1 className="text-xl font-semibold">No analysis yet</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Complete your profile upload to get your first Dating Score.
        </p>
        <Button asChild>
          <Link href="/onboarding">Start my analysis</Link>
        </Button>
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

  const badges = [
    delta !== null && delta > 0 && { icon: "🔥", label: `Profile upgraded — +${delta} points` },
    plan && planProgress > 0 && { icon: "✅", label: `${planProgress}/${plan.days.length} plan days done` },
    latest.overall_score >= 80 && { icon: "⭐", label: "Top-tier profile score" },
  ].filter(Boolean) as { icon: string; label: string }[];

  return (
    <div className="flex flex-col gap-8">
      <ViewTracker event={AnalyticsEvent.DashboardViewed} properties={{ has_active_plan: true }} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your coach&apos;s read on your profile, updated live.</p>
      </div>

      <Card className="overflow-hidden border-primary/30">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            🔥 Dating Score
          </span>
          <div className="flex size-32 items-center justify-center rounded-full bg-brand-gradient text-4xl font-semibold text-primary-foreground shadow-lg shadow-primary/20">
            {latest.overall_score}
          </div>
          {delta !== null && (
            <Badge variant={delta >= 0 ? "default" : "secondary"} className="gap-1">
              {delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {delta >= 0 ? "+" : ""}
              {delta} points since last analysis
            </Badge>
          )}
        </CardContent>
      </Card>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge.label}
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
          label="Photo Score"
          score={latest.photo_score ?? 0}
          recommendation={findRecommendation(recommendations, "photos")}
          improveHref="/dashboard/photos"
        />
        <SubScoreCard
          label="Bio Score"
          score={latest.bio_score ?? 0}
          recommendation={findRecommendation(recommendations, "bio")}
          improveHref="/dashboard/bio"
        />
        <SubScoreCard
          label="Attractiveness Score"
          score={latest.attractiveness_score ?? 0}
          improveHref="/dashboard/photos"
        />
        <SubScoreCard
          label="Conversation Score"
          score={latest.conversation_score ?? 0}
          recommendation={findRecommendation(recommendations, "conversation")}
          improveHref="/dashboard/coach"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress over time</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreHistoryChart points={history} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Your coach, on demand</h2>
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
