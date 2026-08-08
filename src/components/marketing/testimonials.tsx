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
      "J'ai changé ma photo principale suite à l'analyse et mes matchs ont quasiment doublé en une semaine. Je ne m'y attendais pas.",
    rating: 5,
  },
  {
    name: "Julie T.",
    quote:
      "La réécriture de la bio a été le plus utile pour moi — je ne l'aurais jamais écrite comme ça toute seule.",
    rating: 5,
  },
  {
    name: "Karim B.",
    quote: "Direct sur ce qui ne fonctionnait pas, exactement ce dont j'avais besoin. Ça vaut le coup.",
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
          Des résultats concrets pour de vrai
        </motion.h2>
      </div>

      <div className="mx-auto mt-12 flex max-w-4xl snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex w-[80%] shrink-0 snap-center flex-col rounded-xl border border-border bg-card p-5 sm:w-auto sm:shrink"
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

      <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
        {TESTIMONIALS.map((t) => (
          <span key={t.name} className="size-1.5 rounded-full bg-border" />
        ))}
      </div>
    </section>
  );
}
