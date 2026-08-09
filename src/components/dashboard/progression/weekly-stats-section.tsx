"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyStatsForm, type WeeklyStatsSaved } from "@/components/dashboard/progression/weekly-stats-form";
import type { DatingPlatform } from "@/types/database.types";

const PLATFORM_LABEL: Record<DatingPlatform, string> = {
  tinder: "Tinder",
  hinge: "Hinge",
  bumble: "Bumble",
  meetic: "Meetic",
  other: "Autre",
};

export interface ThisWeekEntry {
  platform: DatingPlatform;
  matches: number;
  likes: number;
  conversations: number;
  replies: number;
  dates: number;
}

/** Shows what's already logged for the current week (if anything) and gates the form behind a button once at least one entry exists — avoids re-showing an empty form the user just filled in. */
export function WeeklyStatsSection({ initialThisWeek }: { initialThisWeek: ThisWeekEntry[] }) {
  const [entries, setEntries] = useState(initialThisWeek);
  const [showForm, setShowForm] = useState(initialThisWeek.length === 0);

  function handleSaved(row: WeeklyStatsSaved) {
    setEntries((prev) => [
      ...prev,
      {
        platform: row.platform,
        matches: row.matches,
        likes: row.likes,
        conversations: row.conversations,
        replies: row.replies,
        dates: row.dates,
      },
    ]);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-2 pt-6">
            <p className="text-sm font-medium">Déjà enregistré cette semaine</p>
            {entries.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">{PLATFORM_LABEL[entry.platform]}</span>
                {" — "}
                {entry.matches} matchs · {entry.likes} likes · {entry.conversations} conversations ·{" "}
                {entry.replies} réponses · {entry.dates} dates
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showForm ? (
        <WeeklyStatsForm onSaved={handleSaved} />
      ) : (
        <Button variant="outline" className="w-fit" onClick={() => setShowForm(true)}>
          <Plus className="size-3.5" />
          Ajouter une autre plateforme
        </Button>
      )}
    </div>
  );
}
