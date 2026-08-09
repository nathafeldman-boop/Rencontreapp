"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChipButton } from "@/components/onboarding/chip-button";
import { PLATFORM_OPTIONS } from "@/lib/validations/dating-stats";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { resizeImageToDataUrl } from "@/lib/utils/resize-image";
import type { DatingPlatform } from "@/types/database.types";

// Sanity cap on the ORIGINAL file before resizing — the actual upload is
// always downscaled first (see resize-image.ts), so this just guards
// against something absurd, not the real payload-size constraint anymore.
const MAX_SCREENSHOT_BYTES = 20 * 1024 * 1024;

const FIELDS = [
  { key: "matches", label: "Matchs" },
  { key: "likes", label: "Likes" },
  { key: "conversations", label: "Conversations" },
  { key: "replies", label: "Réponses" },
  { key: "dates", label: "Dates" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];
type PrefillableKey = Extract<FieldKey, "matches" | "conversations" | "likes">;

export interface WeeklyStatsSaved {
  platform: DatingPlatform;
  period_start: string;
  period_end: string;
  matches: number;
  likes: number;
  conversations: number;
  replies: number;
  dates: number;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Monday → Sunday of the current week, so the user never has to pick dates by hand. */
function currentWeekRange() {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: isoDate(monday), end: isoDate(sunday) };
}

/**
 * The weekly check-in: platform + up to 5 numbers, period auto-computed
 * (no date pickers) — designed to take about 30 seconds. The screenshot
 * button prefills whatever the model can count with confidence (see
 * lib/ai/dating-stats-vision.ts); the user still reviews every field and
 * clicks "Enregistrer" themselves before anything is saved.
 */
export function WeeklyStatsForm({ onSaved }: { onSaved: (row: WeeklyStatsSaved) => void }) {
  const [platform, setPlatform] = useState<DatingPlatform>("tinder");
  const [values, setValues] = useState<Record<FieldKey, string>>({
    matches: "",
    likes: "",
    conversations: "",
    replies: "",
    dates: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [prefilledKeys, setPrefilledKeys] = useState<Set<FieldKey>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { start, end } = currentWeekRange();

  function updateValue(key: FieldKey, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setPrefilledKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  async function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Cette capture est trop lourde (max 20 Mo) — recadre-la et réessaie.");
      return;
    }

    setError(null);
    setReading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);

      const res = await fetch("/api/ai/dating-stats/extract-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        setError("Impossible de lire cette capture — remplis les champs à la main.");
        return;
      }

      const { data } = await res.json();
      const estimate = data.estimate as Record<PrefillableKey, number | null>;

      const filled = new Set<FieldKey>();
      setValues((prev) => {
        const next = { ...prev };
        (["matches", "conversations", "likes"] as const).forEach((key) => {
          const value = estimate[key];
          if (value !== null) {
            next[key] = String(value);
            filled.add(key);
          }
        });
        return next;
      });
      setPrefilledKeys(filled);

      if (filled.size === 0) {
        setError("Cette capture ne montre rien que je puisse compter avec certitude — remplis les champs à la main.");
      }
    } catch {
      setError("Impossible de lire cette capture — vérifie ta connexion et réessaie.");
    } finally {
      setReading(false);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    const body: WeeklyStatsSaved = {
      platform,
      period_start: start,
      period_end: end,
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
        setError("Impossible d'enregistrer ces statistiques — réessaie.");
        return;
      }

      onSaved(body);
      track(AnalyticsEvent.DatingStatsAdded, { platform });
    } catch {
      setError("Impossible d'enregistrer — vérifie ta connexion et réessaie.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div>
          <p className="text-sm font-medium">Tes stats de la semaine</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Du {new Date(start).toLocaleDateString("fr-FR", { dateStyle: "medium" })} au{" "}
            {new Date(end).toLocaleDateString("fr-FR", { dateStyle: "medium" })} — 30 secondes, ça suffit.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.filter((p) => p.value !== "other").map((p) => (
            <ChipButton key={p.value} active={platform === p.value} onClick={() => setPlatform(p.value)}>
              {p.label}
            </ChipButton>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key} className="flex items-center gap-1">
                {field.label}
                {prefilledKeys.has(field.key) && <Check className="size-3 text-primary" />}
              </Label>
              <Input
                id={field.key}
                type="number"
                min={0}
                inputMode="numeric"
                className="mt-1.5"
                placeholder="0"
                value={values[field.key]}
                onChange={(e) => updateValue(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleSubmit} disabled={saving} className="w-fit">
            {saving ? <Loader2 className="animate-spin" /> : <Plus />}
            Enregistrer
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            disabled={reading}
            onClick={() => fileInputRef.current?.click()}
          >
            {reading ? <Loader2 className="animate-spin" /> : <Camera />}
            Remplir depuis une capture
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
        </div>
      </CardContent>
    </Card>
  );
}
