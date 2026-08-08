"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Shown on the dashboard for accounts created before the onboarding flow
 * asked about hobbies/lifestyle — without this, the bio generator and
 * other AI tools have nothing real to ground their output in and can end
 * up extending whatever was in the placeholder bio (e.g. inventing a
 * fictional job). Backfills the same onboarding_answers row the current
 * signup flow now collects on day one.
 */
export function HobbiesPrompt() {
  const router = useRouter();
  const [hobbies, setHobbies] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!hobbies.trim()) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/settings/hobbies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobbies: hobbies.trim() }),
      });
      if (!res.ok) {
        setError("Impossible d'enregistrer — réessaie.");
        setStatus("idle");
        return;
      }
      setStatus("done");
      router.refresh();
    } catch {
      setError("Impossible d'enregistrer — vérifie ta connexion et réessaie.");
      setStatus("idle");
    }
  }

  if (status === "done") return null;

  return (
    <Card className="border-primary/30">
      <CardContent className="flex flex-col gap-3 py-5">
        <div>
          <p className="text-sm font-medium">Parle-nous un peu de toi</p>
          <p className="mt-1 text-sm text-muted-foreground">
            On ne t&apos;a pas posé la question à l&apos;inscription — sans ça, l&apos;IA peut inventer des
            détails (un métier, une passion) plutôt que de partir de ce qui est vrai. Tes hobbys, ce que tu fais
            dans la vie, tes centres d&apos;intérêt.
          </p>
        </div>
        <textarea
          rows={3}
          placeholder="Ex : escalade le week-end, je bosse dans le marketing, fan de cuisine thaï..."
          className="w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button size="sm" onClick={submit} disabled={status === "loading" || !hobbies.trim()} className="w-fit">
          {status === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}
