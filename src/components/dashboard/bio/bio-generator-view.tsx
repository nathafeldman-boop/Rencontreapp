"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Copy, Loader2, Pencil, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChipButton } from "@/components/onboarding/chip-button";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { SecondaryPromptsView } from "@/components/dashboard/bio/secondary-prompts-view";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { ProfilePrompt } from "@/lib/profile-prompts";
import type { BioStyle, DatingApp } from "@/types/database.types";

/** How long to wait before refreshing again to pick up the background Mistral rescore (see /api/profile PATCH). */
const RESCORE_REFRESH_DELAY_MS = 12_000;

const STYLES: { value: BioStyle; label: string }[] = [
  { value: "funny", label: "Drôle" },
  { value: "mysterious", label: "Mystérieux" },
  { value: "confident", label: "Confiant" },
  { value: "romantic", label: "Romantique" },
  { value: "premium", label: "Premium" },
];

/** Matches each app's real wording for its free-text bio field, so the tool feels like the app it's for. */
const PRIMARY_BIO_LABEL: Partial<Record<DatingApp, string>> = {
  tinder: "bios Tinder",
  bumble: "descriptions Bumble",
};

export function BioGeneratorView({
  currentBio,
  bioScore,
  bioProblem,
  datingApp,
  currentPrompts,
}: {
  currentBio: string;
  /** Optional — only known once an analysis has run. Shown alongside the current bio when present. */
  bioScore?: number;
  bioProblem?: string;
  /** Drives which prompt/answer format shows (Hinge Accroches, Tinder Fun Facts, Bumble Teasers) and whether the classic bio generator applies (Hinge has no free-text bio in the real app). */
  datingApp?: DatingApp;
  currentPrompts?: ProfilePrompt[] | null;
}) {
  const router = useRouter();
  const [style, setStyle] = useState<BioStyle>("confident");
  const [bios, setBios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftBio, setDraftBio] = useState(currentBio);
  const [savingManual, setSavingManual] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const { copiedKey, copy } = useClipboardCopy();

  async function saveManualBio() {
    setSavingManual(true);
    setManualSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: draftBio }),
      });
      if (res.ok) {
        setManualSaved(true);
        setEditing(false);
        triggerBackgroundRescoreRefresh();
      }
    } finally {
      setSavingManual(false);
    }
  }

  /**
   * The PATCH itself responds fast — Mistral's rescore now runs in the
   * background after the response (see /api/profile's `after()`), so we no
   * longer get a score back synchronously. Refresh once right away (bio
   * text change), then again after a delay to pick up the rescored number.
   */
  function triggerBackgroundRescoreRefresh() {
    router.refresh();
    setRescoring(true);
    setTimeout(() => {
      router.refresh();
      setRescoring(false);
    }, RESCORE_REFRESH_DELAY_MS);
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setSavedIndex(null);

    try {
      const res = await fetch("/api/ai/bio-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style }),
      });

      if (!res.ok) {
        setError(
          res.status === 429
            ? "Tu as utilisé tous tes crédits coaching pour ce mois-ci."
            : "Impossible de générer des bios — réessaie."
        );
        return;
      }

      const { data } = await res.json();
      setBios(data.bios);
      track(AnalyticsEvent.BioGenerated, { style });
    } catch {
      setError("Impossible de générer des bios — vérifie ta connexion et réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function applyBio(bio: string, index: number) {
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) {
        setError("Impossible d'appliquer cette bio — réessaie.");
        return;
      }
      setSavedIndex(index);
      track(AnalyticsEvent.BioApplied, { style });
      triggerBackgroundRescoreRefresh();
    } catch {
      setError("Impossible d'appliquer cette bio — vérifie ta connexion et réessaie.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {datingApp === "hinge" && <SecondaryPromptsView datingApp={datingApp} currentPrompts={currentPrompts ?? null} />}

      {currentBio && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio actuelle</p>
              <div className="flex items-center gap-2">
                {rescoring && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                {bioScore !== undefined && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {bioScore}/100
                  </span>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (!editing) setDraftBio(currentBio);
                    setEditing((e) => !e);
                  }}
                >
                  <Pencil className="size-3.5" />
                  Modifier
                </Button>
              </div>
            </div>

            {bioProblem && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Problème détecté : </span>
                {bioProblem}
              </p>
            )}

            {editing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                />
                <Button size="sm" onClick={saveManualBio} disabled={savingManual || !draftBio.trim()} className="w-fit">
                  {savingManual ? <Loader2 className="animate-spin" /> : <Check className="size-3.5" />}
                  Enregistrer
                </Button>
              </div>
            ) : (
              <p className="text-sm">{currentBio}</p>
            )}

            {manualSaved && !editing && (
              <p className="text-xs text-primary">
                ✓ Bio mise à jour sur ton profil{rescoring && " — recalcul du score en cours…"}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {datingApp === "hinge" ? (
        <p className="text-xs text-muted-foreground">
          Hinge n&apos;a pas de bio en texte libre dans l&apos;appli — utilise le générateur de prompts ci-dessus,
          c&apos;est le seul format que Hinge affiche réellement sur ton profil.
        </p>
      ) : (
        <>
          <div>
            <p className="mb-2 text-sm font-medium">Style</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {STYLES.map((s) => (
                <ChipButton key={s.value} active={style === s.value} onClick={() => setStyle(s.value)}>
                  {s.label}
                </ChipButton>
              ))}
            </div>
          </div>

          <Button onClick={generate} disabled={loading} className="w-fit">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {bios.length > 0 ? "Régénérer" : `Générer 5 ${(datingApp && PRIMARY_BIO_LABEL[datingApp]) ?? "bios"}`}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {bios.length > 0 && (
            <div className="flex flex-col gap-3">
              {bios.map((bio, i) => (
                <motion.div
                  key={`${bio.slice(0, 12)}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="flex flex-col gap-3 p-4">
                      <p className="text-sm">{bio}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copy(bio, i)}>
                          {copiedKey === i ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          {copiedKey === i ? "Copié" : "Copier"}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => applyBio(bio, i)}
                          disabled={savedIndex === i}
                        >
                          {savedIndex === i && rescoring ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : savedIndex === i ? (
                            <Check className="size-3.5" />
                          ) : null}
                          {savedIndex === i ? (rescoring ? "Recalcul du score…" : "Choisie") : "Choisir"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="w-fit">
                <RefreshCw className="size-3.5" />
                Générer 5 de plus
              </Button>

              <FeedbackWidget context="bio_generator" prompt="Ces bios t'ont-elles aidé ?" />
            </div>
          )}

          {(datingApp === "tinder" || datingApp === "bumble") && (
            <SecondaryPromptsView datingApp={datingApp} currentPrompts={currentPrompts ?? null} />
          )}
        </>
      )}
    </div>
  );
}
