"use client";

import { useEffect, useRef, useState } from "react";
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
  {
    name: "Sophie L.",
    quote:
      "Mes conversations mouraient toujours après 2 messages. Depuis le coach IA, j'ai enfin de vraies discussions.",
    rating: 5,
  },
  {
    name: "Thomas D.",
    quote:
      "Le simulateur de conversation m'a fait progresser plus vite qu'un mois entier à swiper au hasard.",
    rating: 4,
  },
  {
    name: "Léa M.",
    quote: "J'étais sceptique sur l'IA pour ce genre de truc, mais les recommandations étaient hyper précises.",
    rating: 5,
  },
];

const AUTOPLAY_INTERVAL_MS = 3200;
const RESUME_AFTER_INTERACTION_MS = 6000;
const MOBILE_QUERY = "(max-width: 639px)";

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pausedUntilRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Keeps the dots in sync with whichever card is actually centered,
  // whether that's from autoplay or the visitor swiping manually.
  useEffect(() => {
    const track = trackRef.current;
    if (!isMobile || !track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = cardRefs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        }
      },
      { root: track, threshold: [0.6] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [isMobile]);

  // Auto-advances the carousel; pauses for a while after the visitor
  // touches it themselves so autoplay doesn't fight a manual swipe.
  useEffect(() => {
    if (!isMobile) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      const next = (activeIndex + 1) % TESTIMONIALS.length;
      cardRefs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isMobile, activeIndex]);

  function pauseAutoplay() {
    pausedUntilRef.current = Date.now() + RESUME_AFTER_INTERACTION_MS;
  }

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

      <div
        ref={trackRef}
        onPointerDown={pauseAutoplay}
        onWheel={pauseAutoplay}
        className="mx-auto mt-12 flex max-w-4xl snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
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
        {TESTIMONIALS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
