"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function BeforeAfterSection() {
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
          Petits changements, vrai résultat
        </motion.h2>
        <p className="mt-3 text-muted-foreground">
          C&apos;est le type de transformation que nos recommandations produisent.
        </p>
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:items-stretch sm:justify-center">
        <ProfileCard
          variant="before"
          score={41}
          bio="J'aime voyager, j'aime rire, j'aime mon chien"
          photoSrc="/marketing/before-after-before.png"
        />

        <div className="flex items-center justify-center py-2 sm:py-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
            <ArrowRight className="size-5" />
          </div>
        </div>

        <ProfileCard
          variant="after"
          score={89}
          bio="En ce moment je m'entraîne pour un semi-marathon et je perds lamentablement contre mon chien à chaque course. Demande-moi quel est le pire sentier que j'ai choisi."
          photoSrc="/marketing/before-after-after.png"
        />
      </div>
    </section>
  );
}

function ProfileCard({
  variant,
  score,
  bio,
  photoSrc,
}: {
  variant: "before" | "after";
  score: number;
  bio: string;
  photoSrc: string;
}) {
  const isAfter = variant === "after";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className={`w-full max-w-[220px] overflow-hidden rounded-2xl border shadow-sm ${
        isAfter ? "border-primary/40 bg-card" : "border-border bg-card grayscale"
      }`}
    >
      <div className="relative aspect-[4/5]">
        <Image src={photoSrc} alt="" fill sizes="220px" className="object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isAfter ? "Après" : "Avant"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isAfter ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            }`}
          >
            {score}/100
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{bio}</p>
      </div>
    </motion.div>
  );
}
