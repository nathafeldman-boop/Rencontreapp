"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SCREEN_DURATION_MS = 2800;

/**
 * Real screenshots of the live product (captured at mobile viewport),
 * not a mocked-up illustration — swap these whenever the underlying pages'
 * design changes meaningfully.
 */
const SCREENS = [
  { src: "/marketing/gameplay/onboarding.png", alt: "Étape de personnalisation de l'analyse dans l'onboarding Flirtcraft" },
  { src: "/marketing/gameplay/results-score.png", alt: "Dating Score révélé sur la page de résultats Flirtcraft" },
  { src: "/marketing/gameplay/results-subscores.png", alt: "Détail des sous-scores et conseils gratuits sur Flirtcraft" },
];

export function GameplayPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), SCREEN_DURATION_MS);
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
                className="absolute inset-0"
              >
                <Image
                  src={SCREENS[index].src}
                  alt={SCREENS[index].alt}
                  fill
                  sizes="280px"
                  className="object-cover object-top"
                  priority={index === 0}
                />
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
