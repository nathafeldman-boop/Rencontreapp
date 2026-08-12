"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Check,
  Copy,
  Info,
  MessageCircle,
  PenLine,
  Rocket,
  Sparkles,
  Swords,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreReveal } from "@/components/results/score-reveal";
import { ShareScoreCard } from "@/components/dashboard/share-score-card";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { themedDatingApp } from "@/lib/theme/dating-app-theme";
import { cn } from "@/lib/utils";
import type { DatingApp, Recommendation } from "@/types/database.types";

export interface ResultsData {
  id?: string;
  overall: number;
  photo: number;
  bio: number;
  attractiveness: number;
  conversation: number;
  freeInsights: string[];
  recommendations: Recommendation[];
  isDemo: boolean;
  isSimulated: boolean;
  biggestProblem?: string;
  datingApp?: DatingApp | null;
}

const SUB_SCORE_LABELS = { photo: "Photos", bio: "Bio", attractiveness: "Attractivité", conversation: "Conversation" };

const CATEGORY_ICONS: Record<Recommendation["category"], typeof Camera> = {
  photos: Camera,
  bio: PenLine,
  conversation: MessageCircle,
};

const CATEGORY_LABELS: Record<Recommendation["category"], string> = {
  photos: "Photos",
  bio: "Bio",
  conversation: "Conversation",
};

const PREMIUM_TOOLS = [
  { icon: Sparkles, label: "Bio Generator", detail: "Des bios prêtes à coller, dans ton style." },
  { icon: MessageCircle, label: "Coach de conversation", detail: "La bonne réponse pour chaque conversation." },
  { icon: Swords, label: "Simulateur de match", detail: "Entraîne-toi avant que ça compte pour de vrai." },
  { icon: TrendingUp, label: "Suivi de progression", detail: "Vois si tes changements font vraiment effet." },
];

const BIO_REWRITE_TITLE = "Version optimisée de ta bio";
const QUICK_WIN_TITLE = "Gain rapide";
const BIGGEST_POTENTIAL_TITLE = "Plus gros potentiel";
const PROBLEM_PREFIX = /^Problème n°\s*\d+\s*:?\s*/i;

function scoreBand(value: number): "weak" | "mid" | "strong" {
  if (value < 45) return "weak";
  if (value < 70) return "mid";
  return "strong";
}

const BAND_BAR_CLASS: Record<ReturnType<typeof scoreBand>, string> = {
  weak: "bg-red-500",
  mid: "bg-amber-500",
  strong: "bg-emerald-500",
};

export function ResultsView({ data }: { data: ResultsData }) {
  const { copiedKey, copy } = useClipboardCopy();

  useEffect(() => {
    track(AnalyticsEvent.AnalysisCompleted, { overall_score: data.overall, is_simulated: data.isSimulated });
  }, [data.overall, data.isSimulated]);

  const subScores = {
    photo: data.photo,
    bio: data.bio,
    attractiveness: data.attractiveness,
    conversation: data.conversation,
  };
  const sortedSubScoreKeys = (Object.keys(subScores) as (keyof typeof subScores)[]).sort(
    (a, b) => subScores[a] - subScores[b]
  );
  const weakestKey = sortedSubScoreKeys[0];
  const strongestKey = sortedSubScoreKeys[sortedSubScoreKeys.length - 1];

  const { problems, bioRewrite, quickWin, biggestPotential, rest } = useMemo(() => {
    const problems: Recommendation[] = [];
    let bioRewrite: Recommendation | undefined;
    let quickWin: Recommendation | undefined;
    let biggestPotential: Recommendation | undefined;
    const rest: Recommendation[] = [];

    for (const rec of data.recommendations) {
      if (rec.title === BIO_REWRITE_TITLE) bioRewrite = rec;
      else if (rec.title === QUICK_WIN_TITLE) quickWin = rec;
      else if (rec.title === BIGGEST_POTENTIAL_TITLE) biggestPotential = rec;
      else if (PROBLEM_PREFIX.test(rec.title)) problems.push(rec);
      else rest.push(rec);
    }

    return { problems, bioRewrite, quickWin, biggestPotential, rest };
  }, [data.recommendations]);

  return (
    <main
      className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12"
      data-dating-app={themedDatingApp(data.datingApp)}
    >
      {data.isDemo && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            <span className="font-medium">Exemple générique, pas ton résultat.</span> Envoie ton profil pour
            obtenir ton vrai score — les chiffres ci-dessous ne parlent pas de toi.
          </p>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <ScoreReveal value={data.overall} />

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-5 text-xl font-semibold"
        >
          Ton profil obtient {data.overall}/100
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="mt-1 text-sm text-muted-foreground"
        >
          {data.biggestProblem
            ? `Tu nous as dit que "${data.biggestProblem}" est ta plus grosse difficulté — voici exactement pourquoi.`
            : `Voici exactement pourquoi tu n'as pas plus de matchs.`}
        </motion.p>

        {!data.isDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.4 }} className="mt-4">
            <ShareScoreCard overallScore={data.overall} photoScore={data.photo} bioScore={data.bio} conversationScore={data.conversation} />
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="mt-8 flex flex-col gap-4"
      >
        {sortedSubScoreKeys.map((key) => (
          <ScoreRow
            key={key}
            label={SUB_SCORE_LABELS[key]}
            value={subScores[key]}
            tag={key === weakestKey ? "weakest" : key === strongestKey ? "strongest" : null}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mt-8 flex flex-col gap-3"
      >
        {data.freeInsights.map((insight, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Conseil gratuit</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2">
              <p className="text-sm">{insight}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* The headline findings — numbered, unmissable, the core "wow" of the free analysis. */}
      {problems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold tracking-tight">Ce qui te coûte le plus de matchs</h2>
          <div className="mt-3 flex flex-col gap-3">
            {problems.map((rec, i) => {
              const Icon = CATEGORY_ICONS[rec.category];
              return (
                <div key={i} className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive text-sm font-bold text-destructive-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Icon className="size-3.5" />
                      {CATEGORY_LABELS[rec.category]}
                    </div>
                    <p className="mt-1 text-sm font-medium">{rec.title.replace(PROBLEM_PREFIX, "")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{rec.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* A concrete, ready-to-use deliverable — not just advice. */}
      {bioRewrite && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold tracking-tight">Ta bio, réécrite pour toi</h2>
          <div className="mt-3 rounded-xl border border-primary/30 bg-accent/30 p-4">
            <p className="text-sm italic">&ldquo;{bioRewrite.detail}&rdquo;</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => copy(bioRewrite.detail, "bio-rewrite")}
            >
              {copiedKey === "bio-rewrite" ? (
                <>
                  <Check className="size-3.5" />
                  Copiée
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {(quickWin || biggestPotential) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.4 }}
          className="mt-8 grid gap-3 sm:grid-cols-2"
        >
          {quickWin && <HighlightCard icon={Zap} label={quickWin.title} detail={quickWin.detail} tone="quick" />}
          {biggestPotential && (
            <HighlightCard icon={Rocket} label={biggestPotential.title} detail={biggestPotential.detail} tone="potential" />
          )}
        </motion.div>
      )}

      {rest.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.4 }}
          className="mt-8 flex flex-col gap-3"
        >
          {rest.map((rec, i) => {
            const Icon = CATEGORY_ICONS[rec.category];
            return (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      <Icon className="mr-1 size-3" />
                      {CATEGORY_LABELS[rec.category]}
                    </Badge>
                    <CardTitle className="text-sm">{rec.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="-mt-2">
                  <p className="text-sm text-muted-foreground">{rec.detail}</p>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* Premium pitch: not "unlock this analysis" (it's already fully shown above) — it's about
          acting on it fast, training, and knowing whether the changes actually worked. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.75, duration: 0.4 }}
        className="mt-10"
      >
        <div className="rounded-2xl border border-primary/30 bg-accent/30 p-5">
          <p className="text-sm font-medium">Tu sais maintenant exactement quoi changer. On peut t&apos;aider à le faire plus vite.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Premium te donne les outils pour appliquer ces changements en quelques minutes, t&apos;entraîner avant
            tes vrais rendez-vous, et suivre si ça marche vraiment.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {PREMIUM_TOOLS.map((tool) => (
              <div key={tool.label} className="flex items-start gap-2">
                <tool.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium">{tool.label}</p>
                  <p className="text-[11px] text-muted-foreground">{tool.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" className="mt-6 w-full" asChild>
          <Link href={data.id ? `/paywall?id=${data.id}` : "/paywall"}>
            Passer à l&apos;action avec mon coach
            <ArrowRight />
          </Link>
        </Button>
      </motion.div>

      {!data.isDemo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.95, duration: 0.4 }} className="mt-6">
          <FeedbackWidget context="results" />
        </motion.div>
      )}
    </main>
  );
}

function ScoreRow({
  label,
  value,
  tag,
}: {
  label: string;
  value: number;
  tag: "weakest" | "strongest" | null;
}) {
  const band = scoreBand(value);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {label}
          {tag === "weakest" && (
            <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
              Plus grosse opportunité
            </span>
          )}
          {tag === "strongest" && (
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Point fort
            </span>
          )}
        </span>
        <span className="font-medium">{value}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={cn("h-full rounded-full", BAND_BAR_CLASS[band])}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function HighlightCard({
  icon: Icon,
  label,
  detail,
  tone,
}: {
  icon: typeof Zap;
  label: string;
  detail: string;
  tone: "quick" | "potential";
}) {
  const toneClass =
    tone === "quick"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
      : "border-primary/30 bg-primary/5 text-primary";
  return (
    <div className={cn("rounded-xl border p-4", toneClass)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1.5 text-sm text-foreground">{detail}</p>
    </div>
  );
}
