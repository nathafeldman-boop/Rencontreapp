"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenLine, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

interface RegenerateResponse {
  data?: { analysis_id: string; overall_score: number; regenerations_remaining: number };
  error?: string;
}

/**
 * Lets a free (pre-paywall) user run their analysis again — as-is, or after
 * tweaking their bio — up to MAX_FREE_REGENERATIONS times per profile (see
 * lib/ai/free-regenerations.ts). The actual cap is enforced server-side in
 * POST /api/analyze/regenerate; `remaining` here is only for display.
 */
export function RegeneratePanel({ currentBio, remaining }: { currentBio: string; remaining: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(currentBio);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate(bio?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bio !== undefined ? { bio } : {}),
      });
      const json: RegenerateResponse = await res.json();
      if (!res.ok || !json.data) {
        setError(json.error ?? "Impossible de régénérer ton analyse — réessaie.");
        return;
      }
      track(AnalyticsEvent.FreeRegenerationUsed, {
        mode: bio !== undefined ? "edited_bio" : "same",
        overall_score: json.data.overall_score,
        regenerations_remaining: json.data.regenerations_remaining,
      });
      setEditing(false);
      router.push(`/results?id=${json.data.analysis_id}`);
    } catch {
      setError("Impossible de régénérer ton analyse — vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  if (remaining <= 0) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 text-center text-sm text-muted-foreground">
        Tu as utilisé tes 3 régénérations gratuites pour ce profil.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border p-4">
      <p className="text-sm font-medium">Pas convaincu par ce résultat ?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Régénère ton analyse gratuitement — il te reste {remaining} régénération{remaining > 1 ? "s" : ""}.
      </p>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            rows={4}
            maxLength={3000}
            placeholder="Ta bio…"
            disabled={loading}
            className="w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => regenerate(bioDraft)} disabled={loading || !bioDraft.trim()}>
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Régénérer avec cette bio
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={loading}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => regenerate()} disabled={loading}>
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Régénérer entièrement
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={loading}>
            <PenLine className="size-3.5" />
            Changer ma bio puis régénérer
          </Button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
