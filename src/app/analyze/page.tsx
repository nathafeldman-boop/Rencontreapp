"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, MessageCircle, ScanFace, Sparkles } from "lucide-react";

const STEPS = [
  { icon: Camera, label: "Analyse de tes photos" },
  { icon: ScanFace, label: "Évaluation de ta bio" },
  { icon: MessageCircle, label: "Potentiel de conversation" },
  { icon: Sparkles, label: "Génération des recommandations" },
];

/**
 * The real pipeline (POST /api/analyze -> Mistral -> `analyses` row) isn't
 * built yet — see src/app/api/analyze/route.ts. This screen still gives a
 * realistic, on-brand loading experience and hands off to /results with a
 * `demo=1` flag so the funnel can be exercised end-to-end today.
 */
export default function AnalyzePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 900);

    const timeout = setTimeout(() => {
      router.push("/results?demo=1");
    }, STEPS.length * 900 + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="mb-8 flex size-16 items-center justify-center rounded-full bg-brand-gradient"
      >
        <Sparkles className="size-7 text-primary-foreground" />
      </motion.div>

      <h1 className="text-xl font-semibold">On analyse ton profil…</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ça prend environ 30 secondes.</p>

      <ul className="mt-10 flex w-full max-w-xs flex-col gap-3">
        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
              i <= activeStep ? "border-primary/40 bg-accent text-accent-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <step.icon className="size-4 shrink-0" />
            {step.label}
          </li>
        ))}
      </ul>
    </main>
  );
}
