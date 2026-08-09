"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import type { ProfilePrompt } from "@/lib/profile-prompts";

/** How long to wait before refreshing again to pick up the background Mistral rescore (see /api/profile PATCH). */
const RESCORE_REFRESH_DELAY_MS = 12_000;

/**
 * Hinge-specific: 3 prompt+answer cards instead of a free-text bio.
 * Purely additive next to BioGeneratorView — saving here flattens the
 * prompts into `profiles.bio` too (see /api/profile PATCH), so scoring
 * and every other reader of `bio` keeps working unchanged.
 */
export function HingePromptsView({ currentPrompts }: { currentPrompts: ProfilePrompt[] | null }) {
  const router = useRouter();
  const [prompts, setPrompts] = useState<ProfilePrompt[]>(currentPrompts ?? []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/ai/bio-generator/prompts", { method: "POST" });

      if (!res.ok) {
        setError(
          res.status === 429
            ? "Tu as utilisé tous tes crédits coaching pour ce mois-ci."
            : "Impossible de générer tes prompts — réessaie."
        );
        return;
      }

      const { data } = await res.json();
      setPrompts(data.answers);
    } catch {
      setError("Impossible de générer tes prompts — vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(index: number, answer: string) {
    setPrompts((prev) => prev.map((p, i) => (i === index ? { ...p, answer } : p)));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts }),
      });

      if (res.ok) {
        setSaved(true);
        router.refresh();
        setRescoring(true);
        setTimeout(() => {
          router.refresh();
          setRescoring(false);
        }, RESCORE_REFRESH_DELAY_MS);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border p-4">
      <div>
        <p className="text-sm font-medium">Prompts façon Hinge</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          3 mini-réponses au lieu d&apos;une bio unique — le format utilisé par Hinge.
        </p>
      </div>

      <Button onClick={generate} disabled={loading} className="w-fit">
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
        {prompts.length > 0 ? "Régénérer" : "Générer mes 3 prompts"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {prompts.length > 0 && (
        <div className="flex flex-col gap-3">
          {prompts.map((p, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.prompt}</p>
                <textarea
                  rows={2}
                  maxLength={200}
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={p.answer}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              {saving || (saved && rescoring) ? <Loader2 className="animate-spin" /> : <Check className="size-3.5" />}
              {saving ? "Enregistrement…" : saved ? (rescoring ? "Recalcul du score…" : "Enregistré") : "Enregistrer sur mon profil"}
            </Button>
            <Button size="sm" variant="ghost" onClick={generate} disabled={loading}>
              <RefreshCw className="size-3.5" />
              Nouvelle série
            </Button>
          </div>

          <FeedbackWidget context="bio_generator" prompt="Ces prompts t'ont-ils aidé ?" />
        </div>
      )}
    </div>
  );
}
