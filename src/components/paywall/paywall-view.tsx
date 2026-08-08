"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Loader2,
  Lock,
  MessageCircle,
  Minus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreReveal } from "@/components/results/score-reveal";
import { useStripeRedirect } from "@/hooks/use-stripe-redirect";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";
import { stripProblemPrefix } from "@/lib/utils/recommendations";
import type { DatingApp, Recommendation } from "@/types/database.types";

// Below-the-fold, framer-motion-heavy sections — deferred so the
// above-the-fold offer and its checkout button aren't waiting on this JS.
const GameplayPreview = dynamic(() =>
  import("@/components/marketing/gameplay-preview").then((m) => m.GameplayPreview)
);
const BeforeAfterSection = dynamic(() =>
  import("@/components/marketing/before-after").then((m) => m.BeforeAfterSection)
);

export interface PaywallPhotoPreview {
  position: number;
  score: number;
  mainIssue: string;
  signedUrl?: string;
}

export interface PaywallData {
  isDemo: boolean;
  firstName: string | null;
  overall: number;
  photo: number;
  bio: number;
  attractiveness: number;
  conversation: number;
  freeInsights: string[];
  recommendations: Recommendation[];
  lockedCount: number;
  bioExcerpt: string | null;
  photoCount: number;
  datingApp: DatingApp | null;
  onboarding: {
    objective?: string;
    weeklyMatches?: string;
    biggestProblem?: string;
    confidence?: string;
  };
  photoPreviews: PaywallPhotoPreview[];
  isSimulated: boolean;
}

const PLAN_ID = "premium_monthly";
const PRICE = "7,99€";

const DATING_APP_LABELS: Record<DatingApp, string> = {
  tinder: "Tinder",
  hinge: "Hinge",
  bumble: "Bumble",
  other: "ton app",
};

const FREE_INCLUDES = ["Score global", "Première analyse", "Points forts", "Premières recommandations"];

const COMPARISON_ROWS: { label: string; free: boolean }[] = [
  { label: "Aperçu du score", free: true },
  { label: "Analyse complète du profil", free: false },
  { label: "Analyse détaillée de chaque photo", free: false },
  { label: "Optimisation de la bio", free: false },
  { label: "Recommandations personnalisées illimitées", free: false },
  { label: "Coach de conversation IA", free: false },
  { label: "Simulateur de match", free: false },
  { label: "Plan d'amélioration personnalisé", free: false },
  { label: "Dashboard personnalisé", free: false },
];

const WHY_CARDS = [
  { icon: Target, title: "Analyse personnalisée", detail: "FlirtCraft analyse ton profil en fonction de tes objectifs." },
  { icon: Bot, title: "IA spécialisée", detail: "Des recommandations adaptées à ton profil, pas des conseils génériques." },
  { icon: MessageCircle, title: "Coach conversationnel", detail: "Obtiens de l'aide lorsque tu ne sais pas quoi répondre." },
  { icon: Zap, title: "Tout au même endroit", detail: "Profil, photos, bio et conversations." },
];

const GUARANTEES = [
  { icon: ShieldCheck, label: "Paiement sécurisé via Stripe" },
  { icon: RotateCcw, label: "Sans engagement — annule à tout moment" },
  { icon: Sparkles, label: "Recommandations générées à partir de ton profil" },
];

const FAQ_ITEMS = [
  {
    q: "Est-ce que je peux annuler quand je veux ?",
    a: "Oui, en un clic depuis Réglages > Gérer l'abonnement, sans appel ni parcours de rétention. Tu gardes l'accès jusqu'à la fin de ta période en cours.",
  },
  {
    q: "Que comprend FlirtCraft Boost ?",
    a: "L'analyse complète de ton profil (photos, bio, attractivité, conversation), le coach de conversation IA, le simulateur de match, le générateur de bio et un plan d'amélioration personnalisé.",
  },
  {
    q: "Est-ce que FlirtCraft garantit plus de matchs ?",
    a: "Non. FlirtCraft optimise ce que les gens voient de ton profil — on ne peut garantir aucun nombre précis de matchs, ça dépend aussi de toi et de l'app que tu utilises.",
  },
  {
    q: "Comment fonctionne l'analyse IA ?",
    a: "Elle passe tes photos et ta bio au crible sur les critères qui font vraiment la différence sur Tinder, Hinge et Bumble, en te comparant à la concurrence réelle sur ces apps.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Tes photos et informations restent privées et servent uniquement à générer ton analyse. Les paiements sont traités par Stripe, qui ne partage jamais ton numéro de carte avec nous.",
  },
];

function scoreHeadline(overall: number): string {
  if (overall < 50) return "Ton profil a plusieurs points qui peuvent fortement être améliorés.";
  if (overall < 75) return "Ton profil a une bonne base. Il reste quelques changements importants pour le rendre beaucoup plus efficace.";
  return "Ton profil est déjà solide. FlirtCraft peut maintenant t'aider à optimiser les détails qui font la différence.";
}

function potentialLabel(overall: number): string {
  if (overall < 50) return "Potentiel à débloquer";
  if (overall < 75) return "Marge de progression";
  return "Détails à peaufiner";
}

export function PaywallView({ data }: { data: PaywallData }) {
  const { loading, error, redirect } = useStripeRedirect();
  const [showSticky, setShowSticky] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track(AnalyticsEvent.PaywallViewed, { trigger: "results" });
  }, []);

  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function handleSubscribe() {
    track(AnalyticsEvent.CheckoutStarted, { plan: PLAN_ID });
    // `subscription_purchased` fires server-side from the Stripe webhook
    // once payment is actually confirmed — see src/app/api/stripe/webhook.
    await redirect("/api/stripe/checkout", {
      body: { plan: PLAN_ID },
      errorMessage: "Le paiement arrive très bientôt — reviens dans quelques jours !",
    });
  }

  const problems = data.recommendations.slice(0, 3);
  const bioProblem = problems.find((r) => r.category === "bio");
  const datingAppLabel = data.datingApp ? DATING_APP_LABELS[data.datingApp] : null;
  const showPersonalization = !data.isDemo && (data.photoCount > 0 || Boolean(data.onboarding.objective));
  const showPreviewCards = !data.isDemo && (data.photoPreviews.length > 0 || Boolean(data.bioExcerpt));

  return (
    <main className="flex flex-1 flex-col pb-24 sm:pb-0">
      {/* Section 1 — Hero: score, headline and primary CTA, all above the fold */}
      <section className="px-6 pt-10 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Badge variant="accent">{data.isDemo ? "Aperçu de démo" : "Ton analyse est prête"}</Badge>
        </motion.div>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mt-6 flex flex-col items-center gap-2.5"
        >
          <ScoreReveal value={data.overall} />
          <span className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {potentialLabel(data.overall)}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mt-7 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {data.firstName ? `${data.firstName}, ton profil peut faire mieux.` : "Ton profil peut faire mieux."}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground"
        >
          {scoreHeadline(data.overall)}
        </motion.p>

        <motion.div
          ref={heroCtaRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          className="mx-auto mt-7 flex max-w-sm flex-col items-center gap-2"
        >
          <Button size="lg" className="w-full" disabled={loading} onClick={handleSubscribe}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Débloquer mon analyse complète
            <ArrowRight />
          </Button>
          <p className="text-xs text-muted-foreground">
            {PRICE} / mois · Sans engagement
          </p>
          {error && <p className="text-xs text-muted-foreground">{error}</p>}
        </motion.div>
      </section>

      {/* Section 2 — what the free tier already gave them */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-md">
          <h2 className="text-lg font-semibold">Ce que tu viens d&apos;obtenir gratuitement</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {FREE_INCLUDES.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium">Mais ce n&apos;est qu&apos;une partie de ton analyse.</p>
        </div>
      </section>

      {/* Prise de conscience — the real, personalized problems the AI found */}
      {problems.length > 0 && (
        <section className="px-6 py-6">
          <div className="mx-auto max-w-md">
            <h2 className="text-lg font-semibold">Voici les 3 choses qui limitent actuellement ton profil</h2>
            <div className="mt-4 flex flex-col gap-3">
              {problems.map((rec, i) => (
                <Card key={i}>
                  <CardContent className="pt-5">
                    <p className="text-sm font-semibold">{rec.title}</p>
                    <p aria-hidden className="mt-1.5 line-clamp-2 text-sm text-muted-foreground blur-[3px] select-none">
                      {rec.detail}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <Lock className="size-3" />
                      Débloque la correction complète
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">FlirtCraft Boost peut t&apos;aider à les corriger.</p>
          </div>
        </section>
      )}

      {/* Section 3 — Gratuit vs Boost comparison */}
      <section className="border-t border-border bg-secondary/30 px-6 py-12">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Gratuit vs FlirtCraft Boost</h2>
        </div>
        <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Fonctionnalité</th>
                <th className="px-3 py-3 text-center font-medium">Gratuit</th>
                <th className="px-3 py-3 text-center font-medium text-primary">Boost</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">{row.label}</td>
                  <td className="px-3 py-2.5 text-center">
                    {row.free ? (
                      <Check className="mx-auto size-4 text-primary" />
                    ) : (
                      <Minus className="mx-auto size-4 text-muted-foreground/40" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <Check className="mx-auto size-4 text-primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4 — personalization, built only from real onboarding/profile data */}
      {showPersonalization && (
        <section className="px-6 py-12">
          <div className="mx-auto max-w-md">
            <h2 className="text-lg font-semibold">Nous avons analysé ton profil.</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <InfoChip label="Photos" value={`${data.photoCount}`} />
              <InfoChip label="Bio" value={data.bioExcerpt ? "Analysée" : "À compléter"} />
              {data.onboarding.objective && <InfoChip label="Objectif" value={data.onboarding.objective} />}
              {datingAppLabel && <InfoChip label="App" value={datingAppLabel} />}
            </div>
          </div>
        </section>
      )}

      {/* Section 5 — premium preview, built from the user's own analysis (no fake results) */}
      {showPreviewCards && (
        <section className="border-t border-border px-6 py-12">
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Un aperçu de ce que tu débloques</h2>
            <p className="mt-2 text-sm text-muted-foreground">Basé sur ta propre analyse — pas un exemple générique.</p>
          </div>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-4">
            {data.photoPreviews.map((preview) => (
              <PhotoPreviewCard key={preview.position} preview={preview} />
            ))}
            {data.bioExcerpt && (
              <BioPreviewCard
                excerpt={data.bioExcerpt}
                score={data.bio}
                problem={bioProblem ? stripProblemPrefix(bioProblem.title) : undefined}
              />
            )}
            <FeaturePreviewCard />
          </div>
        </section>
      )}

      {/* Section 6 — product demo */}
      <GameplayPreview
        title="Voici ce que tu débloques avec FlirtCraft Boost"
        subtitle="Regarde concrètement comment FlirtCraft analyse ton profil et t'aide à améliorer tes conversations."
      />

      {/* Section 7 — before / after */}
      <BeforeAfterSection />

      {/* Section 8 — why FlirtCraft */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Pourquoi FlirtCraft ?</h2>
        </div>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          {WHY_CARDS.map((c) => (
            <Card key={c.title}>
              <CardContent className="flex gap-3 pt-6">
                <c.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 9 — price */}
      <section className="border-t border-border bg-secondary/30 px-6 py-16">
        <div className="mx-auto flex max-w-sm flex-col items-center rounded-2xl border border-primary/40 bg-card p-8 text-center shadow-lg shadow-primary/10">
          <Badge variant="accent">FlirtCraft Boost</Badge>
          <p className="mt-4">
            <span className="text-4xl font-semibold">{PRICE}</span>
            <span className="text-sm text-muted-foreground"> / mois</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Sans engagement.</p>
          <Button size="lg" className="mt-6 w-full" disabled={loading} onClick={handleSubscribe}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Passer à Boost
            <ArrowRight />
          </Button>
        </div>
      </section>

      {/* Section 10 — guarantee / reassurance */}
      <section className="px-6 py-10">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2.5">
          {GUARANTEES.map((g) => (
            <span key={g.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <g.icon className="size-3.5" />
              {g.label}
            </span>
          ))}
        </div>
      </section>

      {/* Section 11 — FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Questions fréquentes</h2>
        </div>
        <div className="mx-auto mt-8 flex max-w-2xl flex-col divide-y divide-border rounded-xl border border-border">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium marker:content-none">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Section 12 — final CTA */}
      <section className="border-t border-border px-6 py-16 text-center">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Prêt à optimiser ton profil ?</h2>
        <div className="mx-auto mt-6 flex max-w-sm flex-col items-center gap-2">
          <Button size="lg" className="w-full" disabled={loading} onClick={handleSubscribe}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Débloquer FlirtCraft Boost
            <ArrowRight />
          </Button>
          <p className="text-xs text-muted-foreground">{PRICE} / mois · Sans engagement</p>
        </div>
      </section>

      <StickyMobileCta visible={showSticky} loading={loading} onClick={handleSubscribe} />
    </main>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function PhotoPreviewCard({ preview }: { preview: PaywallPhotoPreview }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-stretch">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-secondary">
          {preview.signedUrl && (
            <Image
              src={preview.signedUrl}
              alt=""
              fill
              sizes="96px"
              className="scale-110 object-cover blur-md"
              unoptimized
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-background/30">
            <Lock className="size-5 text-white drop-shadow" />
          </div>
        </div>
        <CardContent className="flex-1 py-4 pr-4 pl-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Photo #{preview.position + 1}</p>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {preview.score}/100
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">Problème principal : {preview.mainIssue}</p>
        </CardContent>
      </div>
    </Card>
  );
}

function BioPreviewCard({ excerpt, score, problem }: { excerpt: string; score: number; problem?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Ta bio</p>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{score}/100</span>
        </div>
        <p className="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          <span aria-hidden className="blur-[3px] select-none">
            {excerpt}…
          </span>
        </p>
        {problem && <p className="mt-2 text-xs text-muted-foreground">Problème principal : {problem}</p>}
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
          <Lock className="size-3" />
          Réécriture complète avec Boost
        </p>
      </CardContent>
    </Card>
  );
}

function FeaturePreviewCard() {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <MessageCircle className="size-4 text-primary" />
            Coach de conversation IA
          </p>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            Fonctionnalité incluse
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Colle un message reçu, obtiens 3 réponses adaptées à ton style (Flirt, Drôle, Naturel, Confiant).
        </p>
        <div aria-hidden className="mt-3 flex flex-col gap-1.5 rounded-lg bg-secondary/60 p-2.5 blur-[3px] select-none">
          <div className="h-2 w-2/3 rounded-full bg-muted-foreground/30" />
          <div className="h-2 w-1/2 rounded-full bg-muted-foreground/30" />
          <div className="h-2 w-3/4 rounded-full bg-muted-foreground/30" />
        </div>
      </CardContent>
    </Card>
  );
}

function StickyMobileCta({
  visible,
  loading,
  onClick,
}: {
  visible: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur transition-transform duration-300 sm:hidden",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <Button size="lg" className="w-full" disabled={loading} onClick={onClick}>
        {loading ? <Loader2 className="animate-spin" /> : null}
        Débloquer Boost — {PRICE}/mois
      </Button>
    </div>
  );
}
