import Link from "next/link";
import { ArrowRight, RotateCw } from "lucide-react";

/**
 * In-app substitute for a push notification: `analyses.created_at` already
 * tells us how long it's been since the user last checked in, so this
 * renders itself instead of needing a notifications table or scheduler.
 */
export function ComeBackBanner({ daysSinceLastAnalysis }: { daysSinceLastAnalysis: number }) {
  if (daysSinceLastAnalysis < 5) return null;

  return (
    <Link
      href="/onboarding"
      className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm text-accent-foreground transition-colors hover:bg-accent/80"
    >
      <span className="flex items-center gap-2">
        <RotateCw className="size-4 shrink-0" />
        Ça fait {daysSinceLastAnalysis} jours — relance ton analyse pour voir ce qui a changé.
      </span>
      <ArrowRight className="size-4 shrink-0" />
    </Link>
  );
}
