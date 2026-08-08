"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, GripVertical, Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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

const ROLE_ORDER = { primary: 0, secondary: 1, remove: 2 } as const;
const ROLE_LABEL = { primary: "Photo principale", secondary: "Secondaire", remove: "À envisager de retirer" } as const;

export function PhotoOptimizerView({
  initialPhotos,
  hasAnalysis,
}: {
  initialPhotos: OptimizerPhoto[];
  hasAnalysis: boolean;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderSaved, setOrderSaved] = useState(false);

  async function persistOrder(order: OptimizerPhoto[]) {
    setOrderSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_order: order.map((p) => p.path) }),
    });
    if (res.ok) {
      setOrderSaved(true);
      track(AnalyticsEvent.PhotoOptimizerUsed, { photo_count: order.length });
    }
  }

  function movePhoto(from: number, to: number) {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setPhotos(next);
    persistOrder(next);
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null) return;
    movePhoto(dragIndex, dropIndex);
    setDragIndex(null);
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

      <p className="text-xs text-muted-foreground">
        Glisse une photo pour la réordonner (ou utilise les flèches sur mobile) — l&apos;ordre est enregistré
        automatiquement sur ton profil FlirtCraft. Cela ne modifie pas ton profil Tinder/Hinge/Bumble.
      </p>

      {(built || orderSaved) && (
        <p className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          ✓ L&apos;ordre de ton profil a été mis à jour.
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
                    {photo.score}
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
