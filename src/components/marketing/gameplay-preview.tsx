"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MessageCircle, Sparkles, TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";

const SCREEN_DURATION_MS = 2600;

const SUB_SCORES = [
  { label: "Photos", value: 82 },
  { label: "Bio", value: 91 },
  { label: "Attractivité", value: 78 },
  { label: "Conversation", value: 88 },
];

function UploadScreen() {
  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Étape 1</p>
      <p className="text-sm font-semibold">Envoie ton profil</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex aspect-square items-center justify-center rounded-lg bg-brand-gradient">
          <Camera className="size-5 text-primary-foreground" />
        </div>
        <div className="aspect-square rounded-lg border-2 border-dashed border-border" />
        <div className="aspect-square rounded-lg border-2 border-dashed border-border" />
      </div>
      <div className="mt-auto flex flex-col gap-1.5">
        <div className="h-2.5 w-full rounded-full bg-secondary" />
        <div className="h-2.5 w-4/5 rounded-full bg-secondary" />
      </div>
    </div>
  );
}

function AnalyzingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-5 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        className="flex size-14 items-center justify-center rounded-full bg-brand-gradient"
      >
        <Sparkles className="size-6 text-primary-foreground" />
      </motion.div>
      <p className="text-sm font-semibold">Analyse en cours…</p>
      <p className="text-xs text-muted-foreground">Photos, bio, potentiel de conversation</p>
    </div>
  );
}

function ScoreScreen() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const target = 87;
    const start = performance.now();
    const duration = 900;
    let raf: number;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      setScore(Math.round(target * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ton Dating Score</p>
      <div className="flex size-24 items-center justify-center rounded-full bg-brand-gradient text-3xl font-bold text-primary-foreground">
        {score}
      </div>
      <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
        <TrendingUp className="size-3.5" />
        +23 points
      </span>
    </div>
  );
}

function SubScoresScreen() {
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-5">
      <p className="text-sm font-semibold">Détail du score</p>
      {SUB_SCORES.map((s) => (
        <div key={s.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium">{s.value}</span>
          </div>
          <Progress value={s.value} />
        </div>
      ))}
    </div>
  );
}

function BioRewriteScreen() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <p className="text-sm font-semibold">Ta bio, réécrite par l&apos;IA</p>
      <div className="rounded-lg bg-secondary p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Avant</p>
        <p className="mt-1 text-xs text-muted-foreground line-through decoration-destructive/60">
          J&apos;aime voyager, j&apos;aime rire
        </p>
      </div>
      <div className="rounded-lg border border-primary/30 bg-accent p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Après</p>
        <p className="mt-1 text-xs font-medium text-accent-foreground">
          Champion de pizza-ananas en débat public. Prouve-moi que j&apos;ai tort.
        </p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageCircle className="size-3.5" />3 réponses suggérées
      </div>
    </div>
  );
}

const SCREENS = [UploadScreen, AnalyzingScreen, ScoreScreen, SubScoresScreen, BioRewriteScreen];

export function GameplayPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), SCREEN_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  const Screen = SCREENS[index];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Regarde Flirtcraft à l&apos;œuvre
        </motion.h2>
        <p className="mt-3 text-muted-foreground">
          De l&apos;envoi de ton profil à un score complet — en moins d&apos;une minute.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto mt-10 w-full max-w-[280px]"
      >
        <div className="relative rounded-[2.5rem] border-[6px] border-foreground/90 bg-foreground/90 p-1.5 shadow-2xl shadow-primary/10">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1.5 z-10 mx-auto h-5 w-24 rounded-full bg-foreground/90"
          />
          <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[2rem] bg-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 pt-6"
              >
                <Screen />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {SCREENS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
