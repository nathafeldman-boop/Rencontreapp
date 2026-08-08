"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin, Heart, Sparkles } from "lucide-react";

/**
 * Illustrative examples, not verified customer testimonials — presented as
 * demonstrations of what an optimized profile looks like rather than real
 * customer quotes, since the photos/personas are generated, not real users.
 */
const EXAMPLES = [
  {
    photo: "/marketing/testimonials/camille-29-paris.jpg",
    name: "Camille",
    age: 29,
    city: "Paris",
    quote: "Je pensais que mes photos étaient le problème. En fait, mon profil entier était juste mal présenté.",
    rating: 5,
    bio: "Toujours partante pour un rooftop avec vue et une bonne bouteille de vin nature. J'ai un radar assez précis pour repérer les meilleures adresses avant tout le monde.",
    interests: ["Rooftops", "Vin nature", "Coups de tête"],
    score: 93,
  },
  {
    photo: "/marketing/testimonials/thomas-38-paris.jpg",
    name: "Thomas",
    age: 38,
    city: "Paris",
    quote: "Je n'avais jamais réalisé à quel point ma bio sonnait fade. En dix minutes, j'ai compris pourquoi je matchais si peu.",
    rating: 5,
    bio: "Costume le jour, sneakers le soir. Je connais trois adresses parfaites pour un premier verre et je ne les donne pas à n'importe qui.",
    interests: ["Gastronomie", "Course à pied", "Architecture"],
    score: 91,
  },
  {
    photo: "/marketing/testimonials/manon-32-paris.jpg",
    name: "Manon",
    age: 32,
    city: "Paris",
    quote: "J'ai complètement sous-estimé l'importance de ma bio. La différence entre mon ancien profil et celui-ci est énorme.",
    rating: 5,
    bio: "Probablement en train de chercher le meilleur verre de vin nature du quartier. Si tu as une adresse à me conseiller, commence par là.",
    interests: ["Vin nature", "Terrasses", "Brunchs"],
    score: 90,
  },
  {
    photo: "/marketing/testimonials/julien-34-paris.jpg",
    name: "Julien",
    age: 34,
    city: "Paris",
    quote: "Le plus dur, c'était d'admettre que mes photos ne me représentaient pas bien. Une fois corrigées, tout a changé.",
    rating: 4,
    bio: "Probablement en train de chercher le meilleur café de Paris. Si tu connais une meilleure adresse, je veux bien être convaincu.",
    interests: ["Cafés de spécialité", "Vélo", "Cinéma d'auteur"],
    score: 88,
  },
  {
    photo: "/marketing/testimonials/chloe-27-bord-de-mer.jpg",
    name: "Chloé",
    age: 27,
    city: "Bord de mer",
    quote: "Mes messages mouraient toujours après « salut ». Depuis que mon profil est plus vivant, les conversations durent enfin.",
    rating: 5,
    bio: "Toujours prête à partir sur un coup de tête pour un village au bord de l'eau. Je collectionne les couchers de soleil et les bonnes adresses de glaciers.",
    interests: ["Voyages spontanés", "Bord de mer", "Photographie"],
    score: 94,
  },
  {
    photo: "/marketing/testimonials/nicolas-47-barcelone.jpg",
    name: "Nicolas",
    age: 47,
    city: "Barcelone",
    quote: "À mon âge, je pensais que ce genre d'appli n'était plus pour moi. Le résultat m'a prouvé le contraire.",
    rating: 5,
    bio: "Rooftop au coucher de soleil, bonne compagnie et pas de bruit inutile. J'ai passé l'âge de faire semblant d'aimer ce que je n'aime pas.",
    interests: ["Voile", "Gastronomie", "Voyages en solo"],
    score: 92,
  },
  {
    photo: "/marketing/testimonials/sarah-38-paris.jpg",
    name: "Sarah",
    age: 38,
    city: "Paris",
    quote: "Je ne savais pas qu'un profil pouvait être aussi mal calibré. FlirtCraft m'a montré exactement ce qui clochait.",
    rating: 4,
    bio: "Cocktail à l'ancienne, conversation qui dévie vite du small talk. Je préfère un bar discret à une soirée bondée, toujours.",
    interests: ["Mixologie", "Jazz", "Conversations sans filtre"],
    score: 89,
  },
  {
    photo: "/marketing/testimonials/antoine-36-new-york.jpg",
    name: "Antoine",
    age: 36,
    city: "New York",
    quote: "J'ai testé beaucoup d'applis avant. C'est la première fois qu'on m'a vraiment aidé à comprendre ce qui clochait.",
    rating: 5,
    bio: "Footing à Central Park le matin, bonne carte des vins le soir. Basé entre Paris et New York, disponible pour un café dans les deux fuseaux horaires.",
    interests: ["Course à pied", "Vins", "Voyages"],
    score: 95,
  },
  {
    photo: "/marketing/testimonials/lea-41-lyon.jpg",
    name: "Léa",
    age: 41,
    city: "Lyon",
    quote: "Le plus impressionnant, c'est que je n'ai pas eu besoin de changer qui je suis. J'ai juste enfin compris comment présenter mon profil.",
    rating: 5,
    bio: "Dîners qui se prolongent, expositions le dimanche matin, et une préférence assumée pour les bars à cocktails discrets.",
    interests: ["Art contemporain", "Œnologie", "Sorties discrètes"],
    score: 91,
  },
  {
    photo: "/marketing/testimonials/maxime-41-lyon.jpg",
    name: "Maxime",
    age: 41,
    city: "Lyon",
    quote: "Ma bio ressemblait à un CV. Maintenant elle ressemble à moi.",
    rating: 4,
    bio: "Toujours un peu en retard pour l'apéro et jamais pour un bon resto. Amateur de vieilles pierres et de terrasses au soleil couchant.",
    interests: ["Gastronomie", "Vieilles pierres", "Terrasses"],
    score: 87,
  },
];

const AUTOPLAY_INTERVAL_MS = 1800;
const RESUME_AFTER_INTERACTION_MS = 4000;
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

  // Auto-advances the carousel slowly; pauses for a while after the visitor
  // touches it themselves so autoplay doesn't fight a manual swipe. Scrolls
  // the track's own scrollLeft directly (never scrollIntoView on the card)
  // since these cards are taller than the mobile viewport — scrollIntoView
  // would drag the whole page down with it to fit the card vertically.
  useEffect(() => {
    if (!isMobile) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      const track = trackRef.current;
      const next = (activeIndex + 1) % EXAMPLES.length;
      const card = cardRefs.current[next];
      if (!track || !card) return;
      const targetLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({ left: targetLeft, behavior: "smooth" });
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
          Des profils avant/après, en vrai
        </motion.h2>
        <p className="mt-3 text-muted-foreground">
          Exemples de profils retravaillés avec FlirtCraft — le même style d&apos;optimisation que celle que tu reçois.
        </p>
      </div>

      <div
        ref={trackRef}
        onPointerDown={pauseAutoplay}
        onWheel={pauseAutoplay}
        className="mx-auto mt-12 flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
      >
        {EXAMPLES.map((t, i) => (
          <motion.div
            key={t.name}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            className="flex w-[86%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:w-auto sm:shrink"
          >
            {/* Reviewer */}
            <div className="flex items-start gap-3 p-5 pb-4">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
                <Image src={t.photo} alt={`${t.name}, ${t.age} ans`} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">
                    {t.name}, {t.age}
                  </span>
                  <span className="flex shrink-0 items-center gap-0.5 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="size-3 fill-current" />
                    ))}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              </div>
            </div>

            {/* Optimized dating-profile preview */}
            <div className="mx-5 mb-5 overflow-hidden rounded-xl border border-border bg-background">
              <div className="relative aspect-[4/3]">
                <Image
                  src={t.photo}
                  alt={`Profil de rencontre optimisé de ${t.name}`}
                  fill
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 380px, 300px"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white">
                  <span className="text-sm font-semibold drop-shadow">
                    {t.name}, {t.age}
                  </span>
                  <span className="ml-1.5 inline-flex items-center gap-1 text-[11px] text-white/85">
                    <MapPin className="size-3" />
                    {t.city}
                  </span>
                </div>
                <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow">
                  {t.score}/100
                </span>
              </div>
              <div className="p-3.5">
                <p className="text-xs leading-relaxed text-muted-foreground">{t.bio}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <Heart className="size-3 shrink-0 text-primary" />
                  {t.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 border-t border-border pt-2.5 text-[10px] font-medium text-primary">
                  <Sparkles className="size-3" />
                  Profil optimisé avec FlirtCraft
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-2 flex justify-center gap-1.5 sm:hidden">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-lg text-center text-xs text-muted-foreground">
        Exemples illustratifs de profils optimisés par FlirtCraft, à titre de démonstration.
      </p>
    </section>
  );
}
