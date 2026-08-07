"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChipButton } from "@/components/onboarding/chip-button";
import type { Gender, MatchMessage, MatchPersona } from "@/types/database.types";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Woman" },
  { value: "male", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Surprise me" },
];

const PERSONALITIES = ["Playful", "Shy", "Confident", "Sarcastic", "Sweet"];

type Stage = "setup" | "chatting" | "scored";

export function MatchSimulatorView() {
  const [stage, setStage] = useState<Stage>("setup");
  const [gender, setGender] = useState<Gender>("female");
  const [personality, setPersonality] = useState(PERSONALITIES[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!draft.trim()) return;
    setSending(true);
    setError(null);

    const optimistic: MatchMessage = { role: "user", content: draft };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    const persona: MatchPersona = { gender, personality };
    const res = await fetch("/api/ai/match-simulator/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, persona: sessionId ? undefined : persona, message: optimistic.content }),
    });

    if (!res.ok) {
      setSending(false);
      setError(res.status === 429 ? "You've used all your AI credits for this month." : "Something went wrong.");
      return;
    }

    const { data } = await res.json();
    setSessionId(data.sessionId);
    setMessages((prev) => [...prev, { role: "match", content: data.reply }]);
    setStage("chatting");
    setSending(false);
  }

  async function endSession() {
    if (!sessionId) return;
    setEnding(true);
    const res = await fetch("/api/ai/match-simulator/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setEnding(false);
    if (!res.ok) {
      setError("Couldn't score this conversation — try again.");
      return;
    }
    const { data } = await res.json();
    setResult({ score: data.score, feedback: data.feedback });
    setStage("scored");
  }

  function reset() {
    setStage("setup");
    setSessionId(null);
    setMessages([]);
    setResult(null);
    setError(null);
  }

  if (stage === "setup") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-medium">Match gender</p>
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map((g) => (
              <ChipButton key={g.value} active={gender === g.value} onClick={() => setGender(g.value)}>
                {g.label}
              </ChipButton>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Personality</p>
          <div className="grid grid-cols-3 gap-2">
            {PERSONALITIES.map((p) => (
              <ChipButton key={p} active={personality === p} onClick={() => setPersonality(p)}>
                {p}
              </ChipButton>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            className="flex h-11 flex-1 rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Send your opening line..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={sending || !draft.trim()}>
            {sending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (stage === "scored" && result) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Trophy className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">Conversation score</p>
        <div className="flex size-24 items-center justify-center rounded-full bg-brand-gradient text-3xl font-semibold text-primary-foreground">
          {result.score}
        </div>
        <div className="w-full max-w-xs">
          <Progress value={result.score} />
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">{result.feedback}</p>
        <Button onClick={reset}>Practice again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-4">
          <div ref={scrollRef} className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user" ? "self-end bg-brand-gradient text-primary-foreground" : "self-start bg-secondary"
                }`}
              >
                {m.content}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <input
          className="flex h-11 flex-1 rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Type your reply..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={sending || !draft.trim()}>
          {sending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button variant="outline" onClick={endSession} disabled={ending || messages.length < 2} className="w-fit">
        {ending ? <Loader2 className="animate-spin" /> : <Trophy className="size-4" />}
        End & get my score
      </Button>
    </div>
  );
}
