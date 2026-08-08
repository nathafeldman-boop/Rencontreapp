"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReminderToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !enabled;
    setLoading(true);
    try {
      const res = await fetch("/api/settings/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (res.ok) setEnabled(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {enabled
          ? "Tu reçois un email chaque jour pour mettre à jour tes stats."
          : "Reçois un email chaque jour pour penser à mettre à jour tes stats."}
      </p>
      <Button size="sm" variant={enabled ? "secondary" : "outline"} onClick={toggle} disabled={loading}>
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {enabled ? "Désactiver" : "Activer"}
      </Button>
    </div>
  );
}
