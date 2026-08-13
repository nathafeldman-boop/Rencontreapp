"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, GripVertical, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/client";
import { MAX_PHOTOS } from "@/components/onboarding/photo-dropzone";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

interface OptimizerPhoto {
  path: string;
  url: string;
  score: number;
  pros: string[];
  cons: string[];
  recommendation: string;
  suggestedRole: "primary" | "secondary" | "remove";
}

/**
 * Floor for deleting from the *already-uploaded* set — distinct from
 * onboarding's MIN_PHOTOS (3), which only gates the initial upload step.
 * Matches PATCH /api/profile's own floor (`photos` array min length 1) so
 * users aren't blocked from clearing out bad/test photos once they're
 * already past onboarding.
 */
const MIN_PHOTOS_TO_KEEP = 1;

/** How long to wait before refreshing again to pick up the background Mistral rescore (see /api/profile PATCH). */
const RESCORE_REFRESH_DELAY_MS = 12_000;

/**
 * Debounce for reorder actions (drag or arrow clicks) before triggering a
 * rescore. Each PATCH kicks off an independent, non-deterministic Mistral
 * vision call — without this, clicking up/down a few times in a row (or one
 * drag with a few intermediate drops) fired one full rescore per click, so
 * the same untouched photo could land on a completely different score every
 * few seconds. Reordering settles for a moment before we persist once.
 */
const REORDER_DEBOUNCE_MS = 1500;

const ROLE_ORDER = { primary: 0, secondary: 1, remove: 2 } as const;
const ROLE_LABEL = { primary: "Photo principale", secondary: "Secondaire", remove: "À envisager de retirer" } as const;

export function PhotoOptimizerView({
  initialPhotos,
  hasAnalysis,
}: {
  initialPhotos: OptimizerPhoto[];
  hasAnalysis: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderSaved, setOrderSaved] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const reorderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
    };
  }, []);

  // Re-syncs with the freshly rescored per-photo data once router.refresh()
  // pulls it from the server — our own optimistic edits above only touch
  // ordering/membership, never the score/pros/cons Mistral just recomputed.
  // Adjusted during render (not an effect) to avoid an extra render pass —
  // see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const [prevInitialPhotos, setPrevInitialPhotos] = useState(initialPhotos);
  if (initialPhotos !== prevInitialPhotos) {
    setPrevInitialPhotos(initialPhotos);
    setPhotos(initialPhotos);
  }

  async function persistPhotos(order: OptimizerPhoto[]) {
    setOrderSaved(false);
    // The PATCH itself (saving the photo set) responds fast — Mistral's
    // rescore now runs in the background after the response (see
    // /api/profile's `after()`), so this only reflects the save, not the
    // score recalculation. We refresh once immediately (order/membership),
    // then again after a delay to pick up the rescored numbers.
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: order.map((p) => p.path) }),
    });
    if (res.ok) {
      setOrderSaved(true);
      track(AnalyticsEvent.PhotoOptimizerUsed, { photo_count: order.length });
      router.refresh();
      setRescoring(true);
      setTimeout(() => {
        router.refresh();
        setRescoring(false);
      }, RESCORE_REFRESH_DELAY_MS);
    }
    return res.ok;
  }

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setPhotos(next);

    // Debounced: only persist (and trigger a Mistral rescore) once reordering
    // settles, not once per click/drop — see REORDER_DEBOUNCE_MS above.
    if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
    reorderTimeoutRef.current = setTimeout(() => {
      persistPhotos(next);
    }, REORDER_DEBOUNCE_MS);
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null) return;
    movePhoto(dragIndex, dropIndex);
    setDragIndex(null);
  }

  async function deletePhoto(path: string) {
    if (photos.length <= MIN_PHOTOS_TO_KEEP) {
      setError(`Ton profil doit garder au moins ${MIN_PHOTOS_TO_KEEP} photo.`);
      return;
    }
    setError(null);
    setDeletingPath(path);
    try {
      const next = photos.filter((p) => p.path !== path);
      const ok = await persistPhotos(next);
      if (ok) {
        setPhotos(next);
        const supabase = createClient();
        await supabase.storage.from("profile-photos").remove([path]);
      } else {
        setError("Impossible de supprimer cette photo — réessaie.");
      }
    } finally {
      setDeletingPath(null);
    }
  }

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (photos.length >= MAX_PHOTOS) {
      setError(`Tu peux avoir jusqu'à ${MAX_PHOTOS} photos.`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Ta session a expiré — reconnecte-toi.");
        return;
      }

      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: false });
      if (uploadError) {
        setError(`Échec de l'envoi : ${uploadError.message}`);
        return;
      }

      const { data: signed } = await supabase.storage.from("profile-photos").createSignedUrl(path, 300);

      const next = [
        ...photos,
        {
          path,
          url: signed?.signedUrl ?? "",
          score: 0,
          pros: [],
          cons: [],
          recommendation: "Score en cours de calcul…",
          suggestedRole: "secondary" as const,
        },
      ];
      setPhotos(next);

      const ok = await persistPhotos(next);
      if (!ok) setError("Photo envoyée mais impossible de la lier à ton profil — réessaie.");
    } finally {
      setUploading(false);
    }
  }

  async function buildBestProfile() {
    setBuilding(true);
    setError(null);

    try {
      const res = await fetch("/api/photos/optimize", { method: "POST" });
      if (!res.ok) {
        setError("Impossible de réorganiser tes photos — réessaie.");
        return;
      }

      setPhotos((prev) => [...prev].sort((a, b) => ROLE_ORDER[a.suggestedRole] - ROLE_ORDER[b.suggestedRole] || b.score - a.score));
      setBuilt(true);
      track(AnalyticsEvent.PhotoOptimizerUsed, { photo_count: photos.length });
    } catch {
      setError("Impossible de réorganiser tes photos — vérifie ta connexion et réessaie.");
    } finally {
      setBuilding(false);
    }
  }

  if (!hasAnalysis || photos.length === 0) {
    return (
      <EmptyState
        title="Pas encore d'analyse photo"
        description="Lance d'abord ton analyse de profil pour obtenir un score par photo et des conseils d'ordre."
        action={
          <Button asChild>
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/30 bg-accent p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-accent-foreground">Construire mon meilleur profil</p>
          <p className="text-sm text-muted-foreground">
            Réorganise automatiquement tes photos : la plus forte en premier, les plus faibles reléguées.
          </p>
        </div>
        <Button onClick={buildBestProfile} disabled={building} className="w-full shrink-0 sm:w-auto">
          {building ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {built ? "Reconstruire l'ordre" : "Construire mon meilleur profil"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Glisse une photo pour la réordonner (ou utilise les flèches sur mobile) — chaque changement recalcule ton
          score avec Mistral. Cela ne modifie pas ton profil Tinder/Hinge/Bumble.
        </p>
        <div className="flex items-center gap-2">
          {rescoring && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Recalcul du score…
            </span>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || photos.length >= MAX_PHOTOS}
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            Ajouter une photo
          </Button>
        </div>
      </div>

      {(built || orderSaved) && !rescoring && (
        <p className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          ✓ Ton profil a été mis à jour.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo, i) => (
          <div
            key={photo.path}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          >
            <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Card className="overflow-hidden">
                <div className="relative aspect-[4/3] cursor-grab bg-muted active:cursor-grabbing">
                  {photo.url && (
                    <Image
                      src={photo.url}
                      alt={`Ta photo de profil, notée ${photo.score}/100`}
                      fill
                      sizes="300px"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <Badge
                    className="absolute left-2 top-2"
                    variant={photo.suggestedRole === "remove" ? "secondary" : "default"}
                  >
                    {i === 0 ? "Photo principale" : ROLE_LABEL[photo.suggestedRole]}
                  </Badge>
                  <span className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-background/90 text-sm font-semibold">
                    {photo.score || "…"}
                  </span>
                  <span className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground">
                    <GripVertical className="size-4" />
                  </span>
                  <div className="absolute bottom-2 right-2 flex flex-col overflow-hidden rounded-full bg-background/90">
                    <button
                      type="button"
                      aria-label="Monter cette photo"
                      disabled={i === 0}
                      onClick={() => movePhoto(i, i - 1)}
                      className="flex size-7 items-center justify-center disabled:opacity-30"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre cette photo"
                      disabled={i === photos.length - 1}
                      onClick={() => movePhoto(i, i + 1)}
                      className="flex size-7 items-center justify-center disabled:opacity-30"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Supprimer cette photo"
                    disabled={deletingPath === photo.path || photos.length <= MIN_PHOTOS_TO_KEEP}
                    onClick={() => deletePhoto(photo.path)}
                    className="absolute left-2 bottom-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-destructive disabled:opacity-30"
                  >
                    {deletingPath === photo.path ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  {photo.pros.map((pro) => (
                    <p key={pro} className="flex items-start gap-1.5 text-xs text-foreground">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {pro}
                    </p>
                  ))}
                  {photo.cons.map((con) => (
                    <p key={con} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <X className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                      {con}
                    </p>
                  ))}
                  <p className="mt-1 text-xs font-medium">{photo.recommendation}</p>
                </div>
              </Card>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
