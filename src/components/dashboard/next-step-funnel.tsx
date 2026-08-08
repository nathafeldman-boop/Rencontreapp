import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface FunnelStep {
  key: string;
  label: string;
  description: string;
  href: string;
  done: boolean;
}

/**
 * The dashboard's single "what do I do next" driver — one prioritized
 * checklist, one visible CTA, and a progress bar, instead of a flat grid
 * of equally-weighted tool buttons that left users clicking around with
 * no sense of order. Steps are pre-sorted by the caller (priority order);
 * this always points at the first one not yet done.
 */
export function NextStepFunnel({ steps }: { steps: FunnelStep[] }) {
  const nextStep = steps.find((s) => !s.done);
  const doneCount = steps.filter((s) => s.done).length;

  if (!nextStep) {
    return (
      <Card className="border-primary/30 bg-accent/40">
        <CardContent className="flex flex-col items-center gap-1.5 py-6 text-center">
          <span className="text-2xl">🏆</span>
          <p className="font-medium text-accent-foreground">Tu as essayé tous les outils !</p>
          <p className="text-sm text-muted-foreground">
            Reviens régulièrement — ton score et tes conseils évoluent avec toi.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-accent/40">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Ta prochaine étape</p>
          <p className="text-xs text-muted-foreground">
            {doneCount}/{steps.length} complétées
          </p>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>

        <div>
          <p className="font-medium text-accent-foreground">{nextStep.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{nextStep.description}</p>
        </div>

        <Button asChild className="w-fit">
          <Link href={nextStep.href}>
            C&apos;est parti
            <ArrowRight />
          </Link>
        </Button>

        <div className="flex flex-wrap gap-2 pt-1">
          {steps.map((s) => (
            <span
              key={s.key}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                s.done
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : s.key === nextStep.key
                    ? "border-primary/50 text-accent-foreground"
                    : "border-border text-muted-foreground"
              }`}
            >
              {s.done && <Check className="size-3" />}
              {s.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
