"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SCREEN_DURATION_MS = 3400;

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

/**
 * Slow Ken Burns pan/zoom per screen — a different drift for each so the
 * loop doesn't feel mechanical. Pure transform, the screenshots themselves
 * are untouched.
 */
const KEN_BURNS: { scale: [number, number]; x: [string, string]; y: [string, string] }[] = [
  { scale: [1, 1.14], x: ["0%", "-3%"], y: ["0%", "2.5%"] },
  { scale: [1.12, 1], x: ["-2.5%", "1%"], y: ["1.5%", "-2%"] },
  { scale: [1, 1.16], x: ["1.5%", "-2%"], y: ["-1.5%", "1.5%"] },
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
            <AnimatePresence mode="sync">
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{
                    scale: KEN_BURNS[index % KEN_BURNS.length].scale[0],
                    x: KEN_BURNS[index % KEN_BURNS.length].x[0],
                    y: KEN_BURNS[index % KEN_BURNS.length].y[0],
                  }}
                  animate={{
                    scale: KEN_BURNS[index % KEN_BURNS.length].scale[1],
                    x: KEN_BURNS[index % KEN_BURNS.length].x[1],
                    y: KEN_BURNS[index % KEN_BURNS.length].y[1],
                  }}
                  transition={{ duration: SCREEN_DURATION_MS / 1000, ease: "linear" }}
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
