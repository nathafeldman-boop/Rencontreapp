"use client";

import { useMemo, useState } from "react";
import { Flame, Heart, MessageCircle, Plus, Reply, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ChipButton } from "@/components/onboarding/chip-button";
import { AddStatsForm } from "@/components/dashboard/stats/add-stats-form";
import { MetricBarChart } from "@/components/dashboard/stats/metric-bar-chart";
import { ConnectPlatforms } from "@/components/dashboard/stats/connect-platforms";
import type { DatingPlatform } from "@/types/database.types";

export interface DatingStatRow {
  id: string;
  platform: DatingPlatform;
  period_start: string;
  period_end: string;
  likes: number;
  matches: number;
  conversations: number;
  replies: number;
  dates: number;
  created_at: string;
}

const PERIODS = [
  { value: "today", label: "Aujourd'hui" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "3m", label: "3 mois" },
  { value: "all", label: "Tout" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

function cutoffFor(period: Period): Date | null {
  const now = new Date();
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (period === "3m") return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  return null;
}

const METRICS = [
  { key: "matches", label: "Matchs", icon: Heart },
  { key: "likes", label: "Likes", icon: Flame },
  { key: "conversations", label: "Conversations", icon: MessageCircle },
  { key: "replies", label: "Réponses", icon: Reply },
  { key: "dates", label: "Dates", icon: Sparkles },
] as const;

export function StatsView({ initialStats }: { initialStats: DatingStatRow[] }) {
  const [stats, setStats] = useState(initialStats);
  const [period, setPeriod] = useState<Period>("30d");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const cutoff = cutoffFor(period);
    if (!cutoff) return stats;
    return stats.filter((s) => new Date(s.period_end) >= cutoff);
  }, [stats, period]);

  const totals = useMemo(
    () =>
      METRICS.reduce(
        (acc, m) => {
          acc[m.key] = filtered.reduce((sum, row) => sum + row[m.key], 0);
          return acc;
        },
        {} as Record<(typeof METRICS)[number]["key"], number>
      ),
    [filtered]
  );

  const responseRate = totals.conversations > 0 ? Math.round((totals.replies / totals.conversations) * 100) : null;

  function handleSaved(row: DatingStatRow) {
    setStats((prev) => [row, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <ChipButton key={p.value} active={period === p.value} onClick={() => setPeriod(p.value)}>
            {p.label}
          </ChipButton>
        ))}
      </div>

      {stats.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Connecte tes statistiques pour suivre ta progression."
          description="Ajoute tes likes, matchs et conversations pour voir ton évolution dans le temps."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus />
              Ajouter mes statistiques
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {METRICS.map((m) => (
              <Card key={m.key}>
                <CardContent className="flex flex-col items-center gap-1 py-5 text-center">
                  <m.icon className="size-4 text-primary" />
                  <span className="text-xl font-semibold">{totals[m.key]}</span>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {responseRate !== null && (
            <p className="text-sm text-muted-foreground">
              Taux de réponse sur la période : <span className="font-medium text-foreground">{responseRate}%</span>
            </p>
          )}

          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-sm font-medium">Répartition sur la période</p>
              <MetricBarChart data={METRICS.map((m) => ({ label: m.label, value: totals[m.key] }))} />
            </CardContent>
          </Card>

          {!showForm && (
            <Button variant="outline" onClick={() => setShowForm(true)} className="w-fit">
              <Plus />
              Ajouter mes statistiques
            </Button>
          )}
        </>
      )}

      {showForm && <AddStatsForm onSaved={handleSaved} />}

      <ConnectPlatforms />
    </div>
  );
}
