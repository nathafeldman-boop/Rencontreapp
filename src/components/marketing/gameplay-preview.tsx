"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, Sparkles } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { ScoreReveal } from "@/components/results/score-reveal";

const SCENE_DURATION_MS = 2200;

/**
 * Recreates the real product flow (onboarding -> analysis -> score reveal ->
 * sub-scores) as crisp, animated UI using the app's actual components and
 * copy — rather than a photo of the real screen, which reads as blurry
 * whitespace once blown up to phone-mockup size. Same information, same
 * design tokens, built to read clearly at a glance.
 */
const SCENES = ["onboarding", "analyzing", "score", "subscores"] as const;

const SUB_SCORES = [
  { label: "Photos", value: 58 },
  { label: "Bio", value: 71 },
  { label: "Attractivité", value: 84 },
  { label: "Conversation", value: 66 },
];

export function GameplayPreview({
  title = "Regarde Flirtcraft à l'œuvre",
  subtitle = "De l'envoi de ton profil à un score complet — en moins d'une minute.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SCENES.length), SCENE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

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
          {title}
        </motion.h2>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto mt-10 w-full max-w-[280px]"
      >
        <motion.div
          aria-hidden
          animate={{ opacity: [0.35, 0.55, 0.35], scale: [0.94, 1.02, 0.94] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 -z-10 rounded-[3rem] bg-brand-gradient blur-3xl"
        />

        <div className="relative rounded-[2.5rem] border-[6px] border-foreground/90 bg-foreground/90 p-1.5 shadow-2xl shadow-primary/20">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1.5 z-20 mx-auto h-5 w-24 rounded-full bg-foreground/90"
          />
          <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[2rem] bg-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col px-4 pb-4 pt-8"
              >
                {SCENES[index] === "onboarding" && <OnboardingScene />}
                {SCENES[index] === "analyzing" && <AnalyzingScene />}
                {SCENES[index] === "score" && <ScoreScene />}
                {SCENES[index] === "subscores" && <SubScoresScene />}
              </motion.div>
            </AnimatePresence>

            {/* Glass reflection sweep for a premium screen feel */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 4.6, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-1.5">
          {SCENES.map((_, i) => (
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

function OnboardingScene() {
  const fields = [
    { label: "Âge", value: "27" },
    { label: "Genre", value: "Femme" },
    { label: "Localisation", value: "Paris, France" },
  ];

  return (
    <div className="flex h-full flex-col">
      <Progress value={15} className="h-1.5" />
      <p className="mt-2 text-[10px] text-muted-foreground">Étape 1 / 7</p>
      <h3 className="mt-3 text-sm font-semibold">Personnalisons ton analyse</h3>

      <div className="mt-4 flex flex-col gap-2.5">
        {fields.map((field, i) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.28, duration: 0.3 }}
            className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
          >
            <div>
              <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{field.label}</p>
              <p className="text-xs font-medium">{field.value}</p>
            </div>
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.45 + i * 0.28, duration: 0.2 }}
              className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <Check className="size-2.5" strokeWidth={3} />
            </motion.span>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto flex justify-end">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="rounded-full bg-brand-gradient px-4 py-1.5 text-[10px] font-medium text-primary-foreground"
        >
          Continuer
        </motion.span>
      </div>
    </div>
  );
}

function AnalyzingScene() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        className="flex size-12 items-center justify-center rounded-full bg-brand-gradient"
      >
        <Sparkles className="size-5 text-primary-foreground" />
      </motion.div>
      <div>
        <p className="text-sm font-semibold">Analyse de ton profil…</p>
        <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <Camera className="size-3" />
          Analyse de tes photos...
        </p>
      </div>
      <div className="w-full px-2">
        <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "linear" }}>
          <Progress value={100} className="[&>*]:transition-none" />
        </motion.div>
      </div>
    </div>
  );
}

function ScoreScene() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <ScoreReveal value={88} />
      <div>
        <p className="text-sm font-semibold">Ton profil obtient 88/100</p>
        <p className="mt-1 text-[10px] text-muted-foreground">Voici exactement ce qui te coûte des matchs.</p>
      </div>
    </div>
  );
}

function SubScoresScene() {
  return (
    <div className="flex h-full flex-col justify-center gap-3.5">
      <p className="text-xs font-semibold text-muted-foreground">Le détail de ton score</p>
      {SUB_SCORES.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.15, duration: 0.3 }}
        >
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium">{s.value}/100</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-brand-gradient"
              initial={{ width: "0%" }}
              animate={{ width: `${s.value}%` }}
              transition={{ delay: 0.25 + i * 0.15, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
