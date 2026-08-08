"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Shared phone-mockup chrome (frame, ambient glow, glass reflection sweep,
 * dot indicator) extracted from the original analysis-flow demo so other
 * product demos (e.g. the post-payment dashboard preview on /paywall) can
 * reuse the same premium presentation without duplicating it.
 */
export function PhoneMockupCarousel({
  title,
  subtitle,
  scenes,
  intervalMs = 2200,
}: {
  title: string;
  subtitle: string;
  scenes: React.ReactNode[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % scenes.length), intervalMs);
    return () => clearInterval(id);
  }, [scenes.length, intervalMs]);

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
                {scenes[index]}
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
          {scenes.map((_, i) => (
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
