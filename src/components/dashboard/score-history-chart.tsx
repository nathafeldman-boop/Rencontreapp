"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface ScorePoint {
  date: string;
  score: number;
}

interface ScoreHistoryChartProps {
  points: ScorePoint[];
  /** Shorter height for use as a small-multiple (the 4 sub-score trends on /dashboard/progression). */
  compact?: boolean;
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Inline-SVG line chart — no charting dependency needed for a single
 * sparkline. Gridlines + axis labels + a value badge on the latest point
 * are plain HTML overlaid on top (not SVG text) so they never get
 * distorted by `preserveAspectRatio="none"` stretching a non-square
 * viewBox.
 */
export function ScoreHistoryChart({ points, compact = false }: ScoreHistoryChartProps) {
  const gradientId = useId();
  const heightClass = compact ? "h-24" : "h-40";

  if (points.length < 2) {
    return (
      <p className={`flex ${heightClass} items-center justify-center text-center text-sm text-muted-foreground`}>
        Relance quelques analyses pour voir ta progression dans le temps.
      </p>
    );
  }

  const width = 100;
  const height = 100;
  const padding = 6;
  const max = Math.max(...points.map((p) => p.score), 100);
  const min = Math.min(...points.map((p) => p.score), 0);
  const range = Math.max(1, max - min);

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.score - min) / range) * (height - padding * 2);
    return { x, y, score: p.score };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;
  const last = coords[coords.length - 1];
  const latestScore = points[points.length - 1].score;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <div className="flex w-6 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] text-muted-foreground">
          <span>100</span>
          {!compact && <span>50</span>}
          <span>0</span>
        </div>
        <div className={`relative ${heightClass} min-w-0 flex-1`}>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            <span className="h-px w-full bg-border/70" />
            {!compact && <span className="h-px w-full bg-border/50" />}
            <span className="h-px w-full bg-border/70" />
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <motion.path
              d={areaPath}
              fill={`url(#${gradientId})`}
              stroke="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
            <motion.path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {coords.map((c, i) => (
              <motion.circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={i === coords.length - 1 ? 2.4 : 1.6}
                fill="var(--primary)"
                stroke="var(--card)"
                strokeWidth={i === coords.length - 1 ? 1 : 0}
                vectorEffect="non-scaling-stroke"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
              />
            ))}
          </svg>
          <motion.div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[135%] whitespace-nowrap rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm"
            style={{ left: `${last.x}%`, top: `${last.y}%` }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1 }}
          >
            {latestScore}
          </motion.div>
        </div>
      </div>
      <div className="flex justify-between pl-8 text-[10px] text-muted-foreground">
        <span>{shortDate(points[0].date)}</span>
        <span>{shortDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}
