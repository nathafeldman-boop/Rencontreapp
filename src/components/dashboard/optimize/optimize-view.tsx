"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Sparkles } from "lucide-react";

import { BioGeneratorView } from "@/components/dashboard/bio/bio-generator-view";
import { PhotoOptimizerView } from "@/components/dashboard/photos/photo-optimizer-view";
import { ChipButton } from "@/components/onboarding/chip-button";
import type { ProfilePrompt } from "@/lib/profile-prompts";
import type { DatingApp } from "@/types/database.types";

interface OptimizerPhoto {
  path: string;
  url: string;
  score: number;
  pros: string[];
  cons: string[];
  recommendation: string;
  suggestedRole: "primary" | "secondary" | "remove";
}

const TABS = [
  { value: "bio", label: "Bio", icon: Sparkles },
  { value: "photos", label: "Photos", icon: Camera },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function OptimizeView({
  currentBio,
  bioScore,
  bioProblem,
  datingApp,
  currentPrompts,
  photos,
  hasAnalysis,
}: {
  currentBio: string;
  bioScore?: number;
  bioProblem?: string;
  datingApp?: DatingApp;
  currentPrompts?: ProfilePrompt[] | null;
  photos: OptimizerPhoto[];
  hasAnalysis: boolean;
}) {
  const [tab, setTab] = useState<Tab>("bio");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {TABS.map((t) => (
          <ChipButton key={t.value} active={tab === t.value} onClick={() => setTab(t.value)}>
            <span className="flex items-center gap-1.5">
              <t.icon className="size-3.5" />
              {t.label}
            </span>
          </ChipButton>
        ))}
      </div>

      {tab === "bio" ? (
        <BioGeneratorView
          currentBio={currentBio}
          bioScore={bioScore}
          bioProblem={bioProblem}
          datingApp={datingApp}
          currentPrompts={currentPrompts}
        />
      ) : (
        <PhotoOptimizerView initialPhotos={photos} hasAnalysis={hasAnalysis} />
      )}

      <Link
        href="/dashboard/profile"
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Voir mon profil optimisé
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
