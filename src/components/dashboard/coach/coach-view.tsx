"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChipButton } from "@/components/onboarding/chip-button";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { CoachMode, ConversationSuggestion } from "@/types/database.types";

const TONE_VARIANT = { funny: "accent", flirty: "default", natural: "secondary", confident: "default" } as const;

const MODES: { value: CoachMode; label: string }[] = [
  { value: "auto", label: "Auto (mix)" },
  { value: "flirt", label: "Flirt" },
  { value: "funny", label: "Funny" },
  { value: "natural", label: "Natural" },
  { value: "confident", label: "Confident" },
];

export function CoachView() {
  const [conversation, setConversation] = useState("");
  const [mode, setMode] = useState<CoachMode>("auto");
  const [suggestions, setSuggestions] = useState<ConversationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { copiedKey, copy } = useClipboardCopy();

  async function getSuggestions() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/conversation-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation, mode }),
      });

      if (!res.ok) {
        setError(
          res.status === 429 ? "You've used all your AI credits for this month." : "Couldn't get suggestions — try again."
        );
        return;
      }

      const { data } = await res.json();
      setSuggestions(data.suggestions);
      track(AnalyticsEvent.ConversationCoachUsed, {});
    } catch {
      setError("Couldn't get suggestions — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium">Mode</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {MODES.map((m) => (
            <ChipButton key={m.value} active={mode === m.value} onClick={() => setMode(m.value)}>
              {m.label}
            </ChipButton>
          ))}
        </div>
      </div>

      <div>
        <textarea
          rows={6}
          placeholder={`Match: Hey!\nYou: Hi! How's it going?\nMatch: Good! What are you up to this weekend?`}
          className="w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
        />
        <Button onClick={getSuggestions} disabled={loading || conversation.trim().length === 0} className="mt-3">
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Get 3 replies
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          {suggestions.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card>
                <CardContent className="flex flex-col gap-2 p-4">
                  <Badge variant={TONE_VARIANT[s.tone]} className="w-fit capitalize">
                    {s.tone}
                  </Badge>
                  <p className="text-sm font-medium">{s.message}</p>
                  <p className="text-xs text-muted-foreground">{s.explanation}</p>
                  <Button size="sm" variant="outline" className="w-fit" onClick={() => copy(s.message, i)}>
                    {copiedKey === i ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copiedKey === i ? "Copied" : "Copy"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
