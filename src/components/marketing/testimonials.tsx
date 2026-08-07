"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

/**
 * Placeholder copy for launch — swap for real, verifiable reviews (with
 * consent) before this goes live to paid traffic. Intentionally uses
 * initials avatars and first-name-plus-initial attribution rather than any
 * photo or full name, so nothing here impersonates a specific real person.
 */
const TESTIMONIALS = [
  {
    name: "Marc R.",
    quote:
      "Changed my main photo based on the analysis and matches basically doubled in a week. Didn't expect that.",
    rating: 5,
  },
  {
    name: "Julie T.",
    quote:
      "The bio rewrite was the useful part for me — I'd never have written it that way myself.",
    rating: 5,
  },
  {
    name: "Karim B.",
    quote: "Blunt about what wasn't working, which is exactly what I needed. Worth it.",
    rating: 4,
  },
];

export function Testimonials() {
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
          People are getting real results
        </motion.h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <Star key={idx} className="size-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                {t.name[0]}
              </div>
              <span className="text-sm font-medium">{t.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
