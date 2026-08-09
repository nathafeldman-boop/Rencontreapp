"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labelForEvent, type ActivitySession } from "@/lib/admin/activity-display";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "long" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** Real, timestamped session/action history — see lib/admin/activity-display.ts for the 30-min session heuristic. */
export function ActivityTimeline({ sessions }: { sessions: ActivitySession[] }) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sessions (regroupées, 30 min de silence = nouvelle session)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sessions.map((session, i) => (
          <SessionRow key={i} session={session} />
        ))}
      </CardContent>
    </Card>
  );
}

function SessionRow({ session }: { session: ActivitySession }) {
  const [expanded, setExpanded] = useState(false);
  const count = session.events.length;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{formatDate(session.startedAt)}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(session.startedAt)} → {formatTime(session.endedAt)} · {session.durationMinutes} min ·{" "}
            {count} action{count > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 rounded-md text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {expanded ? "Réduire" : `Historique complet (${count} action${count > 1 ? "s" : ""})`}
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>

      {expanded && (
        <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          {[...session.events].reverse().map((event, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-xs">
              <span>{labelForEvent(event.event)}</span>
              <span className="shrink-0 text-muted-foreground">{formatTime(event.occurredAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
