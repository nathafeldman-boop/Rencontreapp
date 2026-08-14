"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, PenLine, Plus, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { MAX_PHOTOS } from "@/components/onboarding/photo-dropzone";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

/** Post-onboarding floor — matches PATCH /api/profile's own minimum (1), not onboarding's stricter 3. */
const MIN_PHOTOS_TO_KEEP = 1;

interface RegenerateResponse {
  data?: { analysis_id: string; overall_score: number; regenerations_remaining: number };
  error?: string;
}

interface PanelPhoto {
  path: string;
  url: string;
}

/**
 * Lets a free (pre-paywall) user run their analysis again — as-is, or after
 * tweaking their bio and/or photos — up to MAX_FREE_REGENERATIONS times per
 * profile (see lib/ai/free-regenerations.ts). The actual cap is enforced
 * server-side in POST /api/analyze/regenerate; `remaining` here is only for
 * display. Editing photos here (rather than sending users back through
 * onboarding, which duplicate-inserts a new profile row) was the whole
 * point of adding this — bio-only editing left "swap a bad photo" with no
 * free-tier path at all.
 */
export function RegeneratePanel({
  currentBio,
  currentPhotos,
  remaining,
}: {
  currentBio: string;
  currentPhotos: PanelPhoto[];
  remaining: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState(currentBio);
  const [photos, setPhotos] = useState<PanelPhoto[]>(currentPhotos);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removePhoto(path: string) {
    if (photos.length <= MIN_PHOTOS_TO_KEEP) {
      setError(`Garde au moins ${MIN_PHOTOS_TO_KEEP} photo.`);
      return;
    }
    setError(null);
    setPhotos((prev) => prev.filter((p) => p.path !== path));
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
      setPhotos((prev) => [...prev, { path, url: signed?.signedUrl ?? "" }]);
    } finally {
      setUploading(false);
    }
  }

  async function regenerate(withEdits: boolean) {
    setLoading(true);
    setError(null);
    try {
      const body = withEdits ? { bio: bioDraft, photos: photos.map((p) => p.path) } : {};
      const res = await fetch("/api/analyze/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json: RegenerateResponse = await res.json();
      if (!res.ok || !json.data) {
        setError(json.error ?? "Impossible de régénérer ton analyse — réessaie.");
        return;
      }
      track(AnalyticsEvent.FreeRegenerationUsed, {
        mode: withEdits ? "edited_bio_and_photos" : "same",
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

      {loading ? (
        <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin" />
          Régénération en cours — ça peut prendre jusqu&apos;à une minute, ne quitte pas cette page.
        </div>
      ) : editing ? (
        <div className="mt-3 flex flex-col gap-3">
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            rows={4}
            maxLength={3000}
            placeholder="Ta bio…"
            className="w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.path} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {photo.url && <Image src={photo.url} alt="" fill sizes="120px" className="object-cover" unoptimized />}
                <button
                  type="button"
                  aria-label="Retirer cette photo"
                  disabled={photos.length <= MIN_PHOTOS_TO_KEEP}
                  onClick={() => removePhoto(photo.path)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/90 text-destructive disabled:opacity-30"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-input text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />

          <div className="flex gap-2">
            <Button size="sm" onClick={() => regenerate(true)} disabled={uploading || !bioDraft.trim()}>
              <RefreshCw className="size-3.5" />
              Régénérer avec ces changements
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => regenerate(false)}>
            <RefreshCw className="size-3.5" />
            Régénérer entièrement
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <PenLine className="size-3.5" />
            Changer ma bio ou mes photos
          </Button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
