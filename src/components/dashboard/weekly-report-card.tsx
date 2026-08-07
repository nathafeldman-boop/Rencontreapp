"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WeeklyReport } from "@/lib/reports/weekly-report";

export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function copyOpener(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your weekly Dating Report</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          {report.scoreDelta === null ? (
            <p className="text-sm text-muted-foreground">
              Come back in a few days to see how your score moved this week.
            </p>
          ) : (
            <Badge variant={report.scoreDelta >= 0 ? "default" : "secondary"} className="gap-1">
              {report.scoreDelta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {report.scoreDelta >= 0 ? "+" : ""}
              {report.scoreDelta} points this week
            </Badge>
          )}
        </div>

        {(report.bestPhoto || report.worstPhoto) && (
          <div>
            <p className="mb-2 text-sm font-medium">Your photos, ranked</p>
            <div className="grid grid-cols-2 gap-3">
              {report.bestPhoto && (
                <PhotoStat label="Working best" url={report.bestPhoto.url} score={report.bestPhoto.score} tone="good" />
              )}
              {report.worstPhoto && (
                <PhotoStat label="Holding you back" url={report.worstPhoto.url} score={report.worstPhoto.score} tone="bad" />
              )}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">3 openers to test this week</p>
          <div className="flex flex-col gap-2">
            {report.openers.map((opener, i) => (
              <div key={opener} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <p className="text-sm">{opener}</p>
                <button
                  type="button"
                  onClick={() => copyOpener(opener, i)}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Copy opener"
                >
                  {copiedIndex === i ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PhotoStat({ label, url, score, tone }: { label: string; url: string; score: number; tone: "good" | "bad" }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-square bg-secondary">
        {url && <Image src={url} alt={label} fill className="object-cover" unoptimized />}
      </div>
      <div className="flex items-center justify-between p-2.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Badge variant={tone === "good" ? "default" : "secondary"}>{score}</Badge>
      </div>
    </div>
  );
}
