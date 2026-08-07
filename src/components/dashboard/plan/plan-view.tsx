"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { PlanDay } from "@/types/database.types";

export function PlanView({ initialDays }: { initialDays: PlanDay[] | null }) {
  const [days, setDays] = useState<PlanDay[] | null>(initialDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/ai/dating-plan", { method: "POST" });
    if (!res.ok) {
      setLoading(false);
      setError(
        res.status === 429 ? "You've used all your AI credits for this month." : "Couldn't build your plan — try again."
      );
      return;
    }

    const { data } = await res.json();
    setDays(data.days);
    setLoading(false);
  }

  async function toggleDay(day: PlanDay) {
    setDays((prev) => prev?.map((d) => (d.day === day.day ? { ...d, done: !d.done } : d)) ?? prev);
    await fetch("/api/ai/dating-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: day.day, done: !day.done }),
    });
  }

  if (!days) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-muted-foreground">You don&apos;t have a plan yet.</p>
        <Button onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Build my plan
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>
    );
  }

  const doneCount = days.filter((d) => d.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{doneCount}/7 days</span>
        </div>
        <Progress value={(doneCount / 7) * 100} />
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day, i) => (
          <motion.div key={day.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={day.done ? "border-primary/40 bg-accent" : ""}>
              <CardContent className="flex items-start gap-3 p-4">
                <button
                  onClick={() => toggleDay(day)}
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    day.done ? "border-primary bg-brand-gradient text-primary-foreground" : "border-border"
                  }`}
                  aria-label={day.done ? "Mark as not done" : "Mark as done"}
                >
                  {day.done && <Check className="size-3.5" />}
                </button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Day {day.day}</p>
                  <p className={`font-medium ${day.done ? "line-through opacity-70" : ""}`}>{day.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{day.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="w-fit">
        {loading ? <Loader2 className="animate-spin" /> : <RefreshCw className="size-3.5" />}
        Regenerate plan
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
