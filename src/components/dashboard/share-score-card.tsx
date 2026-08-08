"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

interface ShareScoreCardProps {
  overallScore: number;
  photoScore?: number;
  bioScore?: number;
  conversationScore?: number;
  className?: string;
}

/**
 * Generates the branded score card (see api/share/score-card/route.ts) and
 * hands it to the OS share sheet on mobile (so it goes straight into
 * TikTok/Instagram/Twitter as a native share target) or downloads it on
 * desktop.
 */
export function ShareScoreCard({ overallScore, photoScore, bioScore, conversationScore, className }: ShareScoreCardProps) {
  const [loading, setLoading] = useState(false);

  function buildUrl() {
    const params = new URLSearchParams({ score: String(overallScore) });
    if (photoScore !== undefined) params.set("photo", String(photoScore));
    if (bioScore !== undefined) params.set("bio", String(bioScore));
    if (conversationScore !== undefined) params.set("conversation", String(conversationScore));
    return `/api/share/score-card?${params.toString()}`;
  }

  async function share() {
    setLoading(true);
    try {
      const res = await fetch(buildUrl());
      const blob = await res.blob();
      const file = new File([blob], "my-dating-score.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Mon Dating Score",
          text: `J'ai obtenu ${overallScore}/100 sur Flirtcraft 🔥`,
        });
        track(AnalyticsEvent.ScoreShared, { overall_score: overallScore, method: "share_sheet" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-dating-score.png";
        a.click();
        URL.revokeObjectURL(url);
        track(AnalyticsEvent.ScoreShared, { overall_score: overallScore, method: "download" });
      }
    } catch {
      // User canceled the share sheet, or download failed silently — not worth surfacing an error for a share action.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={share} disabled={loading} className={className}>
      {loading ? <Loader2 className="animate-spin" /> : <Share2 className="size-4" />}
      Partager mon Dating Score
    </Button>
  );
}
