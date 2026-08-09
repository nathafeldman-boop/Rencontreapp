import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface TrendBadgeProps {
  deltaPct: number | null;
}

/** Small colored up/down/flat indicator for week-over-week comparisons. */
export function TrendBadge({ deltaPct }: TrendBadgeProps) {
  if (deltaPct === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="size-3" />
        —
      </span>
    );
  }

  const isUp = deltaPct > 0;
  const isFlat = deltaPct === 0;
  const Icon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;
  const colorClass = isFlat ? "text-muted-foreground" : isUp ? "text-emerald-500" : "text-destructive";

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
      <Icon className="size-3" />
      {isUp ? "+" : ""}
      {deltaPct}%
    </span>
  );
}
