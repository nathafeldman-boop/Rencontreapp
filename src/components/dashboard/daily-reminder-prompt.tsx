"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Shown once, the first time a user has `daily_reminder_enabled === null`
 * (not yet asked). Tinder/Hinge/Bumble/Meetic have no public API and never
 * will be connected — stats stay manual by design (see
 * /dashboard/progression), so this closes that gap by nudging people back
 * daily to log them and check in with their coach after a match.
 */
export function DailyReminderPrompt() {
  const [status, setStatus] = useState<"idle" | "loading" | "answered">("idle");
  const [enabled, setEnabled] = useState(false);

  async function answer(value: boolean) {
    setStatus("loading");
    try {
      const res = await fetch("/api/settings/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: value }),
      });
      if (res.ok) {
        setEnabled(value);
        setStatus("answered");
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  }

  if (status === "answered") {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
          <Bell className="size-4 shrink-0 text-primary" />
          {enabled
            ? "C'est noté — tu recevras un rappel quotidien pour mettre à jour tes stats."
            : "Pas de souci, tu peux l'activer à tout moment depuis Réglages."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">Un rappel quotidien ?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tinder et Meetic ne permettent pas de connexion automatique, donc on t&apos;envoie un email chaque
              jour pour te rappeler de mettre à jour tes matchs et conversations toi-même — et de venir demander
              à ton coach quoi répondre si tu as un nouveau match.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          <Button size="sm" onClick={() => answer(true)} disabled={status === "loading"} className="flex-1 sm:flex-none">
            {status === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Oui, rappelle-moi
          </Button>
          <Button size="sm" variant="ghost" onClick={() => answer(false)} disabled={status === "loading"} className="flex-1 sm:flex-none">
            Non merci
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
