"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
const ROLE_LABEL = { primary: "Primary photo", secondary: "Secondary", remove: "Consider removing" } as const;

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

  async function buildBestProfile() {
    setBuilding(true);
    setError(null);

    const res = await fetch("/api/photos/optimize", { method: "POST" });
    if (!res.ok) {
      setBuilding(false);
      setError("Couldn't reorder your photos — try again.");
      return;
    }

    setPhotos((prev) => [...prev].sort((a, b) => ROLE_ORDER[a.suggestedRole] - ROLE_ORDER[b.suggestedRole] || b.score - a.score));
    setBuilding(false);
    setBuilt(true);
  }

  if (!hasAnalysis || photos.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-sm text-muted-foreground">No photo analysis yet.</p>
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/30 bg-accent p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-accent-foreground">Build my best profile</p>
          <p className="text-sm text-muted-foreground">
            Automatically reorder your photos: strongest lead photo first, weakest deprioritized.
          </p>
        </div>
        <Button onClick={buildBestProfile} disabled={building} className="w-full shrink-0 sm:w-auto">
          {building ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {built ? "Rebuild order" : "Build my best profile"}
        </Button>
      </div>

      {built && (
        <p className="rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          ✓ Your profile order has been updated.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.path}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                {photo.url && <Image src={photo.url} alt="" fill sizes="300px" className="object-cover" unoptimized />}
                <Badge
                  className="absolute left-2 top-2"
                  variant={photo.suggestedRole === "remove" ? "secondary" : "default"}
                >
                  {ROLE_LABEL[photo.suggestedRole]}
                </Badge>
                <span className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-background/90 text-sm font-semibold">
                  {photo.score}
                </span>
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
        ))}
      </div>
    </div>
  );
}
