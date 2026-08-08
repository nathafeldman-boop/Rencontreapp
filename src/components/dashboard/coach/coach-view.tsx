"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, Copy, Loader2, Sparkles } from "lucide-react";

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
  { value: "funny", label: "Drôle" },
  { value: "natural", label: "Naturel" },
  { value: "confident", label: "Confiant" },
];

const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024;

export function CoachView() {
  const [conversation, setConversation] = useState("");
  const [mode, setMode] = useState<CoachMode>("auto");
  const [suggestions, setSuggestions] = useState<ConversationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readingScreenshot, setReadingScreenshot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copiedKey, copy } = useClipboardCopy();

  async function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Cette capture est trop lourde (max 4 Mo) — recadre-la ou fais une capture plus courte.");
      return;
    }

    setError(null);
    setReadingScreenshot(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/ai/conversation-coach/extract-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Impossible de lire cette capture — réessaie ou écris ta conversation.");
        return;
      }

      const { data } = await res.json();
      setConversation(data.text);
    } catch {
      setError("Impossible de lire cette capture — vérifie ta connexion et réessaie.");
    } finally {
      setReadingScreenshot(false);
    }
  }

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
          res.status === 429 ? "Tu as utilisé tous tes crédits IA pour ce mois-ci." : "Impossible d'obtenir des suggestions — réessaie."
        );
        return;
      }

      const { data } = await res.json();
      setSuggestions(data.suggestions);
      track(AnalyticsEvent.ConversationCoachUsed, {});
    } catch {
      setError("Impossible d'obtenir des suggestions — vérifie ta connexion et réessaie.");
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
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Ta conversation</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={readingScreenshot}
          >
            {readingScreenshot ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
            {readingScreenshot ? "Lecture de la capture…" : "Envoyer une capture"}
          </Button>
        </div>
        <textarea
          rows={6}
          placeholder={`Match : Salut !\nToi : Hey, ça va ?\nMatch : Bien ! Tu fais quoi ce week-end ?\n\n...ou envoie directement une capture d'écran de ta conversation.`}
          className="w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
        />
        <Button onClick={getSuggestions} disabled={loading || conversation.trim().length === 0} className="mt-3">
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Obtenir 3 réponses
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
                    {copiedKey === i ? "Copié" : "Copier"}
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
