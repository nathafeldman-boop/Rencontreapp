"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { PlanDay } from "@/types/database.types";

export function PlanView({ initialDays }: { initialDays: PlanDay[] | null }) {
  const [days, setDays] = useState<PlanDay[] | null>(initialDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/dating-plan", { method: "POST" });
      if (!res.ok) {
        setError(
          res.status === 429 ? "Tu as utilisé tous tes crédits coaching pour ce mois-ci." : "Impossible de créer ton plan — réessaie."
        );
        return;
      }

      const { data } = await res.json();
      setDays(data.days);
      track(AnalyticsEvent.DatingPlanGenerated, {});
    } catch {
      setError("Impossible de créer ton plan — vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleDay(day: PlanDay) {
    setError(null);
    setDays((prev) => prev?.map((d) => (d.day === day.day ? { ...d, done: !d.done } : d)) ?? prev);

    try {
      const res = await fetch("/api/ai/dating-plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: day.day, done: !day.done }),
      });
      if (!res.ok) throw new Error("toggle failed");
    } catch {
      // Roll back the optimistic flip — otherwise the checkbox stays checked
      // (or unchecked) forever while the server-side plan disagrees, with no
      // indication anything went wrong until the next full page load.
      setDays((prev) => prev?.map((d) => (d.day === day.day ? { ...d, done: day.done } : d)) ?? prev);
      setError("Impossible d'enregistrer — réessaie.");
    }
  }

  if (!days) {
    return (
      <EmptyState
        title="Tu n'as pas encore de plan"
        description="Obtiens un plan jour par jour personnalisé, construit à partir de ta dernière analyse."
        action={
          <div className="flex flex-col items-center gap-2">
            <Button onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Créer mon plan
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        }
      />
    );
  }

  const doneCount = days.filter((d) => d.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-1.5 flex justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium">{doneCount}/7 jours</span>
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
                  aria-label={day.done ? "Marquer comme non fait" : "Marquer comme fait"}
                >
                  {day.done && <Check className="size-3.5" />}
                </button>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Jour {day.day}</p>
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
        Régénérer le plan
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
