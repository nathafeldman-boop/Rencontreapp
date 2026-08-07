"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChipButton } from "@/components/onboarding/chip-button";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { BioStyle } from "@/types/database.types";

const STYLES: { value: BioStyle; label: string }[] = [
  { value: "funny", label: "Funny" },
  { value: "mysterious", label: "Mysterious" },
  { value: "confident", label: "Confident" },
  { value: "romantic", label: "Romantic" },
  { value: "premium", label: "Premium" },
];

export function BioGeneratorView({ currentBio }: { currentBio: string }) {
  const [style, setStyle] = useState<BioStyle>("confident");
  const [bios, setBios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setSavedIndex(null);

    const res = await fetch("/api/ai/bio-generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style }),
    });

    if (!res.ok) {
      setLoading(false);
      setError(
        res.status === 429
          ? "You've used all your AI credits for this month."
          : "Couldn't generate bios — try again."
      );
      return;
    }

    const { data } = await res.json();
    setBios(data.bios);
    setLoading(false);
    track(AnalyticsEvent.BioGenerated, { style });
  }

  async function copy(bio: string, index: number) {
    await navigator.clipboard.writeText(bio);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  async function applyBio(bio: string, index: number) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    if (res.ok) setSavedIndex(index);
  }

  return (
    <div className="flex flex-col gap-6">
      {currentBio && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current bio</p>
            <p className="mt-1 text-sm">{currentBio}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">Style</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {STYLES.map((s) => (
            <ChipButton key={s.value} active={style === s.value} onClick={() => setStyle(s.value)}>
              {s.label}
            </ChipButton>
          ))}
        </div>
      </div>

      <Button onClick={generate} disabled={loading} className="w-fit">
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {bios.length > 0 ? "Regenerate" : "Generate 5 bios"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {bios.length > 0 && (
        <div className="flex flex-col gap-3">
          {bios.map((bio, i) => (
            <motion.div
              key={`${bio.slice(0, 12)}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="flex flex-col gap-3 p-4">
                  <p className="text-sm">{bio}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(bio, i)}>
                      {copiedIndex === i ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => applyBio(bio, i)} disabled={savedIndex === i}>
                      {savedIndex === i ? <Check className="size-3.5" /> : null}
                      {savedIndex === i ? "Saved to profile" : "Use this bio"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="w-fit">
            <RefreshCw className="size-3.5" />
            Generate 5 more
          </Button>

          <FeedbackWidget context="bio_generator" prompt="Did these bios help you?" />
        </div>
      )}
    </div>
  );
}
