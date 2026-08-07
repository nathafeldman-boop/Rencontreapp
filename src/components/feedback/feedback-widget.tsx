"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageSquarePlus, ThumbsDown, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChipButton } from "@/components/onboarding/chip-button";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { FeedbackCategory } from "@/types/database.types";

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  bug: "Signaler un bug",
  feature: "Suggérer une fonctionnalité",
  general: "Avis général",
};

type Stage = "prompt" | "form" | "done";

async function submitFeedback(body: {
  category: FeedbackCategory;
  context: string;
  helpful?: boolean;
  message?: string;
}) {
  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    track(AnalyticsEvent.FeedbackSubmitted, { category: body.category, helpful: body.helpful });
  } catch {
    // Best-effort — a dropped feedback submission isn't worth surfacing an error for.
  }
}

/**
 * "Did MatchAI help you?" widget — dropped in after key moments (results,
 * an AI tool run). Thumbs up/down submits immediately; either choice can
 * expand into an optional bug/feature/general note.
 */
export function FeedbackWidget({ context, prompt = "MatchAI t'a-t-il aidé ?" }: { context: string; prompt?: string }) {
  const [stage, setStage] = useState<Stage>("prompt");
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleThumb(value: boolean) {
    setHelpful(value);
    setStage("done");
    await submitFeedback({ category: "general", context, helpful: value });
  }

  async function handleFormSubmit() {
    setSubmitting(true);
    try {
      await submitFeedback({
        category,
        context,
        helpful: helpful ?? undefined,
        message: message.trim() || undefined,
      });
      setStage("done");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="py-5">
        <AnimatePresence mode="wait">
          {stage === "prompt" && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-4"
            >
              <p className="text-sm font-medium">{prompt}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleThumb(true)} aria-label="Oui, ça m'a aidé">
                  <ThumbsUp className="size-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleThumb(false)} aria-label="Non, ça ne m'a pas aidé">
                  <ThumbsDown className="size-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {stage === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <p className="text-sm font-medium">Qu&apos;as-tu en tête ?</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_LABEL) as FeedbackCategory[]).map((key) => (
                  <ChipButton key={key} active={category === key} onClick={() => setCategory(key)}>
                    {CATEGORY_LABEL[key]}
                  </ChipButton>
                ))}
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Donne-nous plus de détails (optionnel)"
                rows={3}
                maxLength={2000}
                className="flex w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button onClick={handleFormSubmit} disabled={submitting} className="w-fit">
                {submitting ? <Loader2 className="animate-spin" /> : null}
                Envoyer l&apos;avis
              </Button>
            </motion.div>
          )}

          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between gap-4"
            >
              <p className="text-sm text-muted-foreground">
                {helpful === false
                  ? "Merci — désolé que ça n'ait pas fait mouche."
                  : "Merci pour ton retour !"}
              </p>
              <button
                type="button"
                onClick={() => setStage("form")}
                className="flex items-center gap-1.5 rounded-md text-xs text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <MessageSquarePlus className="size-3.5" />
                Un bug ou une idée ?
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
