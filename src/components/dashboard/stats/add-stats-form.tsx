"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChipButton } from "@/components/onboarding/chip-button";
import { PLATFORM_OPTIONS } from "@/lib/validations/dating-stats";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { DatingStatRow } from "@/components/dashboard/stats/stats-view";
import type { DatingPlatform } from "@/types/database.types";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  now.setDate(now.getDate() - day);
  return now;
}

const NUMBER_FIELDS = [
  { key: "matches", label: "Matchs" },
  { key: "likes", label: "Likes" },
  { key: "conversations", label: "Conversations" },
  { key: "replies", label: "Réponses" },
  { key: "dates", label: "Dates" },
] as const;

export function AddStatsForm({ onSaved }: { onSaved: (row: DatingStatRow) => void }) {
  const [platform, setPlatform] = useState<DatingPlatform>("tinder");
  const [periodStart, setPeriodStart] = useState(isoDate(startOfWeek()));
  const [periodEnd, setPeriodEnd] = useState(isoDate(new Date()));
  const [values, setValues] = useState<Record<(typeof NUMBER_FIELDS)[number]["key"], string>>({
    matches: "",
    likes: "",
    conversations: "",
    replies: "",
    dates: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    const body = {
      platform,
      period_start: periodStart,
      period_end: periodEnd,
      matches: Number(values.matches) || 0,
      likes: Number(values.likes) || 0,
      conversations: Number(values.conversations) || 0,
      replies: Number(values.replies) || 0,
      dates: Number(values.dates) || 0,
    };

    try {
      const res = await fetch("/api/dating-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setError("Impossible d'enregistrer ces statistiques — vérifie les dates et réessaie.");
        return;
      }

      onSaved({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...body });
      setValues({ matches: "", likes: "", conversations: "", replies: "", dates: "" });
      track(AnalyticsEvent.DatingStatsAdded, { platform });
    } catch {
      setError("Impossible d'enregistrer — vérifie ta connexion et réessaie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 pt-6">
        <div>
          <p className="mb-2 text-sm font-medium">Plateforme</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {PLATFORM_OPTIONS.map((p) => (
              <ChipButton key={p.value} active={platform === p.value} onClick={() => setPlatform(p.value)}>
                {p.label}
              </ChipButton>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="period_start">Du</Label>
            <Input
              id="period_start"
              type="date"
              className="mt-1.5"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="period_end">Au</Label>
            <Input
              id="period_end"
              type="date"
              className="mt-1.5"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NUMBER_FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="number"
                min={0}
                inputMode="numeric"
                className="mt-1.5"
                placeholder="0"
                value={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSubmit} disabled={saving} className="w-fit">
          {saving ? <Loader2 className="animate-spin" /> : <Plus />}
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}
