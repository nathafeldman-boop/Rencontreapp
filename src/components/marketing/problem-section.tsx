"use client";

import { motion } from "framer-motion";
import { ImageOff, MessageCircleOff, Ban, FileQuestion } from "lucide-react";

const PAIN_POINTS = [
  {
    icon: ImageOff,
    title: "Tes photos ne te mettent pas en valeur",
    description: "Tu es mieux en vrai, mais tes photos ne le montrent pas.",
  },
  {
    icon: FileQuestion,
    title: "Ta bio ressemble à toutes les autres",
    description: '"J\'aime voyager, j\'aime rire" — swipée en une demi-seconde.',
  },
  {
    icon: Ban,
    title: "Des matchs, mais presque aucune réponse",
    description: "On te voit. On ne te choisit juste pas.",
  },
  {
    icon: MessageCircleOff,
    title: "Des conversations qui ne mènent nulle part",
    description: "\"Salut\" reçoit un \"salut\", puis... silence.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-t border-border bg-secondary/30 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Ça te parle ?
        </motion.h2>
        <p className="mt-3 text-muted-foreground">
          Ce n&apos;est pas toi. C&apos;est ton profil — et ça se corrige.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
        {PAIN_POINTS.map((point, i) => (
          <motion.div
            key={point.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <point.icon className="size-5" />
            </div>
            <div>
              <h3 className="font-medium">{point.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
