"use client";

import { motion } from "framer-motion";
import { ArrowRight, ImageIcon } from "lucide-react";

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
          Small changes, real difference
        </motion.h2>
        <p className="mt-3 text-muted-foreground">
          This is the kind of shift our recommendations produce.
        </p>
      </div>

      <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:items-stretch sm:justify-center">
        <ProfileCard
          variant="before"
          score={41}
          bio="Love to travel, love to laugh, love my dog"
        />

        <div className="flex items-center justify-center py-2 sm:py-0">
          <div className="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
            <ArrowRight className="size-5" />
          </div>
        </div>

        <ProfileCard
          variant="after"
          score={89}
          bio="Currently training for a half-marathon and losing badly to my dog at every race. Ask me about the worst trail I've ever picked."
        />
      </div>
    </section>
  );
}

function ProfileCard({
  variant,
  score,
  bio,
}: {
  variant: "before" | "after";
  score: number;
  bio: string;
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
      <div
        className={`flex aspect-[4/5] items-center justify-center ${
          isAfter ? "bg-brand-gradient" : "bg-muted"
        }`}
      >
        <ImageIcon className={`size-10 ${isAfter ? "text-primary-foreground/70" : "text-muted-foreground/50"}`} />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isAfter ? "After" : "Before"}
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
