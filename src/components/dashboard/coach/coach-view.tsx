"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, Copy, Loader2, MessageCircleMore, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { resizeImageToDataUrl } from "@/lib/utils/resize-image";
import type { CoachMode, ConversationSuggestion } from "@/types/database.types";

const TONE_VARIANT = { funny: "accent", flirty: "default", natural: "secondary", confident: "default" } as const;

const MODES: { value: CoachMode; label: string; emoji: string }[] = [
  { value: "auto", label: "Auto", emoji: "🎲" },
  { value: "flirt", label: "Flirt", emoji: "😏" },
  { value: "funny", label: "Drôle", emoji: "😂" },
  { value: "natural", label: "Naturel", emoji: "🙂" },
  { value: "confident", label: "Confiant", emoji: "💪" },
];

// Sanity cap on the ORIGINAL file before resizing — the actual upload is
// always downscaled first (see resize-image.ts), so this just guards
// against something absurd, not the real payload-size constraint anymore.
const MAX_SCREENSHOT_BYTES = 20 * 1024 * 1024;

type Turn =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; suggestions: ConversationSuggestion[] }
  | { id: string; role: "error"; message: string };

function newId() {
  return crypto.randomUUID();
}

/**
 * A real back-and-forth chat, not a one-shot form: paste (or send a
 * screenshot of) a conversation, get 3 replies in the thread, send the
 * next one whenever — mirrors a standard chat-app layout (message thread
 * + bottom input bar) instead of a static "textarea → 3 result cards"
 * page.
 */
export function CoachView() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CoachMode>("auto");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [readingScreenshot, setReadingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { copiedKey, copy } = useClipboardCopy();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  async function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setScreenshotError("Cette capture est trop lourde (max 20 Mo) — recadre-la ou fais une capture plus courte.");
      return;
    }

    setScreenshotError(null);
    setReadingScreenshot(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);

      const res = await fetch("/api/ai/conversation-coach/extract-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setScreenshotError(body?.error ?? "Impossible de lire cette capture — réessaie ou écris ta conversation.");
        return;
      }

      const { data } = await res.json();
      setInput(data.text);
      textareaRef.current?.focus();
    } catch {
      setScreenshotError("Impossible de lire cette capture — vérifie ta connexion et réessaie.");
    } finally {
      setReadingScreenshot(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setTurns((prev) => [...prev, { id: newId(), role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/conversation-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: text, mode }),
      });

      if (!res.ok) {
        const message =
          res.status === 429 ? "Tu as utilisé tous tes crédits coaching pour ce mois-ci." : "Impossible d'obtenir des suggestions — réessaie.";
        setTurns((prev) => [...prev, { id: newId(), role: "error", message }]);
        return;
      }

      const { data } = await res.json();
      setTurns((prev) => [...prev, { id: newId(), role: "ai", suggestions: data.suggestions }]);
      track(AnalyticsEvent.ConversationCoachUsed, {});
    } catch {
      setTurns((prev) => [
        ...prev,
        { id: newId(), role: "error", message: "Impossible d'obtenir des suggestions — vérifie ta connexion et réessaie." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div ref={scrollRef} className="flex flex-col gap-4 overflow-y-auto p-4" style={{ minHeight: "22rem", maxHeight: "60vh" }}>
          {turns.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-brand-gradient">
                <MessageCircleMore className="size-5 text-primary-foreground" />
              </span>
              <div>
                <p className="font-medium">Colle ta conversation, ou envoie une capture</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ton coach te propose 3 réponses adaptées au mode choisi ci-dessus.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={readingScreenshot}>
                {readingScreenshot ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                {readingScreenshot ? "Lecture de la capture…" : "Envoyer une capture"}
              </Button>
            </div>
          ) : (
            turns.map((turn) => <TurnBubble key={turn.id} turn={turn} copy={copy} copiedKey={copiedKey} />)
          )}

          {loading && (
            <div className="flex items-center gap-2 self-start rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Ton coach réfléchit…
            </div>
          )}
        </div>

        {screenshotError && <p className="border-t border-border px-4 py-2 text-xs text-destructive">{screenshotError}</p>}

        <div className="flex items-end gap-2 border-t border-border p-3">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={readingScreenshot}
            aria-label="Envoyer une capture d'écran"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {readingScreenshot ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Colle ta conversation, ou écris ton message…"
            className="max-h-32 min-w-0 flex-1 resize-none rounded-2xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || input.trim().length === 0}
            aria-label="Envoyer"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground transition-opacity disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </div>

      {turns.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => {
            setTurns([]);
            setInput("");
          }}
        >
          <Sparkles className="size-3.5" />
          Nouvelle conversation
        </Button>
      )}
    </div>
  );
}

function TurnBubble({
  turn,
  copy,
  copiedKey,
}: {
  turn: Turn;
  copy: (text: string, key: string | number) => void;
  copiedKey: string | number | null;
}) {
  if (turn.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-brand-gradient px-4 py-2.5 text-sm text-primary-foreground"
      >
        {turn.text}
      </motion.div>
    );
  }

  if (turn.role === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
      >
        {turn.message}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex max-w-[90%] flex-col gap-2 self-start">
      {turn.suggestions.map((s, i) => (
        <div key={i} className="rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-3">
          <Badge variant={TONE_VARIANT[s.tone]} className="w-fit capitalize">
            {s.tone}
          </Badge>
          <p className="mt-2 text-sm font-medium">{s.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">{s.explanation}</p>
          <Button size="sm" variant="outline" className="mt-2 w-fit" onClick={() => copy(s.message, `${turn.id}-${i}`)}>
            {copiedKey === `${turn.id}-${i}` ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copiedKey === `${turn.id}-${i}` ? "Copié" : "Copier"}
          </Button>
        </div>
      ))}
    </motion.div>
  );
}
