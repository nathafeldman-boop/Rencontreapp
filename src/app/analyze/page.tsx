"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, ScanFace, Sparkles, TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const STEPS = [
  { icon: Camera, label: "Analyzing your photos..." },
  { icon: ScanFace, label: "Comparing your profile..." },
  { icon: TrendingUp, label: "Finding improvements..." },
  { icon: Sparkles, label: "Building your strategy..." },
];

const TOTAL_DURATION_MS = 13_000;
const STEP_DURATION_MS = TOTAL_DURATION_MS / STEPS.length;

export default function AnalyzePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const resultRef = useRef<{ analysisId: string | null; failed: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    track(AnalyticsEvent.AnalysisStarted, {});

    fetch("/api/analyze", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) throw new Error("analysis failed");
        const { data } = await res.json();
        return data.analysis_id as string;
      })
      .then((analysisId) => {
        if (!cancelled) resultRef.current = { analysisId, failed: false };
      })
      .catch(() => {
        if (!cancelled) resultRef.current = { analysisId: null, failed: true };
      });

    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / TOTAL_DURATION_MS) * 100);
      setProgress(pct);
      setActiveStep(Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_DURATION_MS)));
    }, 100);

    const finish = setTimeout(() => {
      clearInterval(tick);
      setProgress(100);

      const finalize = () => {
        const result = resultRef.current;
        if (cancelled) return;
        if (result?.analysisId) {
          router.push(`/results?id=${result.analysisId}`);
        } else if (result?.failed) {
          router.push("/results?demo=1");
        } else {
          // API still in flight — give it a little more room, then fall back.
          setTimeout(() => {
            if (cancelled) return;
            const late = resultRef.current;
            router.push(late?.analysisId ? `/results?id=${late.analysisId}` : "/results?demo=1");
          }, 2000);
        }
      };

      finalize();
    }, TOTAL_DURATION_MS);

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearTimeout(finish);
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

      <h1 className="text-xl font-semibold">Analyzing your profile…</h1>
      <p className="mt-1 text-sm text-muted-foreground">This takes about 15 seconds.</p>

      <div className="mt-8 w-full max-w-xs">
        <Progress value={progress} />
      </div>

      <ul className="mt-6 flex w-full max-w-xs flex-col gap-3">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.label}
            animate={{
              opacity: i <= activeStep ? 1 : 0.4,
              scale: i === activeStep ? 1.02 : 1,
            }}
            transition={{ duration: 0.3 }}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
              i <= activeStep ? "border-primary/40 bg-accent text-accent-foreground" : "border-border text-muted-foreground"
            }`}
          >
            <step.icon className="size-4 shrink-0" />
            {step.label}
          </motion.li>
        ))}
      </ul>
    </main>
  );
}
