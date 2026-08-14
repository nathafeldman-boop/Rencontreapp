"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, Camera, RefreshCcw, ScanFace, Sparkles, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

const STEPS = [
  { icon: Camera, label: "Analyse de tes photos..." },
  { icon: ScanFace, label: "Comparaison de ton profil..." },
  { icon: TrendingUp, label: "Recherche d'améliorations..." },
  { icon: Sparkles, label: "Construction de ta stratégie..." },
];

const TOTAL_DURATION_MS = 13_000;
const STEP_DURATION_MS = TOTAL_DURATION_MS / STEPS.length;
/**
 * Extra 1s polls after the 13s animation completes, before giving up and
 * showing the error screen. A real analysis (photo download + Mistral,
 * with its retry-on-timeout) can legitimately take up to ~55-58s end to
 * end — this used to be 5 (18s total patience), which was shorter than a
 * normal real run, not just a slow one. The "Réessayer" button was masking
 * this: it wasn't actually broken, the client just gave up before the
 * still-in-flight first request ever got a chance to finish.
 */
const MAX_EXTRA_POLL_ATTEMPTS = 60;

interface AnalysisResult {
  analysisId: string | null;
  failed: boolean;
  errorMessage?: string;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [waitingLonger, setWaitingLonger] = useState(false);
  const resultRef = useRef<AnalysisResult | null>(null);

  function runAnalysis() {
    setError(null);
    setProgress(0);
    setActiveStep(0);
    setWaitingLonger(false);
    resultRef.current = null;
    let cancelled = false;
    track(AnalyticsEvent.AnalysisStarted, {});

    fetch("/api/analyze", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "L'analyse a échoué.");
        }
        const { data } = await res.json();
        return data.analysis_id as string;
      })
      .then((analysisId) => {
        if (!cancelled) resultRef.current = { analysisId, failed: false };
      })
      .catch((err) => {
        if (!cancelled)
          resultRef.current = {
            analysisId: null,
            failed: true,
            errorMessage: err instanceof Error ? err.message : "L'analyse a échoué.",
          };
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
      setWaitingLonger(true);

      const finalize = (attempt = 0) => {
        if (cancelled) return;
        const result = resultRef.current;
        if (result?.analysisId) {
          router.push(`/results?id=${result.analysisId}`);
        } else if (result?.failed) {
          // A real failure — show it, never a fake score standing in for a
          // real one (see BUG history: this used to silently redirect to
          // /results?demo=1, which showed generic numbers a user could
          // easily mistake for their actual analysis).
          setError(result.errorMessage ?? "L'analyse a échoué.");
        } else if (attempt < MAX_EXTRA_POLL_ATTEMPTS) {
          // API still in flight — give it a little more room before giving up.
          setTimeout(() => finalize(attempt + 1), 1000);
        } else {
          setError("L'analyse prend plus de temps que prévu — réessaie dans un instant.");
        }
      };

      finalize();
    }, TOTAL_DURATION_MS);

    return () => {
      cancelled = true;
      clearInterval(tick);
      clearTimeout(finish);
    };
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runAnalysis resets state so it can also be called from the manual "Réessayer" button, not just on mount; on mount those resets are no-ops against the initial values.
    return runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runAnalysis is stable enough for a one-shot-on-mount + manual-retry pattern; re-running it on every render identity change would restart the progress animation.
  }, []);

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <h1 className="mt-6 text-xl font-semibold">L&apos;analyse n&apos;a pas pu se terminer</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button onClick={() => runAnalysis()}>
            <RefreshCcw />
            Réessayer
          </Button>
          <Link href="/onboarding" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Revenir à l&apos;envoi du profil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        className="mb-8 flex size-16 items-center justify-center rounded-full bg-brand-gradient"
      >
        <Sparkles className="size-7 text-primary-foreground" />
      </motion.div>

      <h1 className="text-xl font-semibold">Analyse de ton profil…</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ça prend environ 15 secondes.</p>

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

      {waitingLonger && (
        <p className="mt-6 max-w-xs text-center text-sm text-muted-foreground">
          Ton profil demande un peu plus d&apos;analyse que d&apos;habitude — ça arrive, ne quitte pas cette page.
        </p>
      )}
    </main>
  );
}
