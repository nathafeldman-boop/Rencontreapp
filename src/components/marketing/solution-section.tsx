"use client";

import { motion } from "framer-motion";
import { Camera, Gauge, MessageCircle, Sparkles } from "lucide-react";

const SOLUTIONS = [
  {
    icon: Camera,
    title: "AI Photo Analysis",
    description: "We rank your photos by swipe-right potential and tell you exactly which to lead with.",
  },
  {
    icon: Sparkles,
    title: "AI Bio Optimization",
    description: "A rewritten bio built around what actually makes you interesting — not generic filler.",
  },
  {
    icon: MessageCircle,
    title: "Conversation Coach",
    description: "Opening lines and reply strategies tailored to your profile, not copy-pasted templates.",
  },
  {
    icon: Gauge,
    title: "Match Score",
    description: "A single number that tracks your profile strength — and moves every time you improve it.",
  },
];

export function SolutionSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          What MatchAI actually does
        </motion.h2>
        <p className="mt-3 text-muted-foreground">
          One upload. A complete, personalized breakdown.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        {SOLUTIONS.map((solution, i) => (
          <motion.div
            key={solution.title}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6"
          >
            <div
              aria-hidden
              className="absolute -right-8 -top-8 size-24 rounded-full bg-brand-gradient opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
            />
            <div className="flex size-11 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
              <solution.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-medium">{solution.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{solution.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
