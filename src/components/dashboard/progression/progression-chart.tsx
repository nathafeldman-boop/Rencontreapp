"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface ScorePoint {
  date: string;
  score: number;
}

interface StatPoint {
  date: string;
  value: number;
}

interface ProgressionChartProps {
  scorePoints: ScorePoint[];
  /** Secondary series (e.g. weekly matches), drawn as bars behind the score line on the same date axis. */
  statPoints?: StatPoint[];
  statLabel?: string;
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Score line (see score-history-chart.tsx for the base technique) with a
 * weekly-stats bar series overlaid on the same date axis behind it — this
 * is what gives the score curve a cause-and-effect story ("more matches
 * logged the week the score jumped"). Gridlines/axis labels/the latest
 * value are plain HTML overlaid on the SVG, same reasoning as
 * score-history-chart.tsx (avoids text distortion from `preserveAspectRatio="none"`).
 */
export function ProgressionChart({ scorePoints, statPoints = [], statLabel }: ProgressionChartProps) {
  const gradientId = useId();

  if (scorePoints.length < 2) {
    return (
      <p className="flex h-52 items-center justify-center text-center text-sm text-muted-foreground">
        Relance quelques analyses pour voir ta progression dans le temps.
      </p>
    );
  }

  const width = 100;
  const height = 100;
  const padding = 6;

  const allTimes = [
    ...scorePoints.map((p) => new Date(p.date).getTime()),
    ...statPoints.map((p) => new Date(p.date).getTime()),
  ];
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);
  const timeRange = Math.max(1, maxTime - minTime);

  const xFor = (iso: string) => padding + ((new Date(iso).getTime() - minTime) / timeRange) * (width - padding * 2);

  const maxScore = Math.max(...scorePoints.map((p) => p.score), 100);
  const minScore = Math.min(...scorePoints.map((p) => p.score), 0);
  const scoreRange = Math.max(1, maxScore - minScore);
  const yForScore = (score: number) => height - padding - ((score - minScore) / scoreRange) * (height - padding * 2);

  const scoreCoords = scorePoints.map((p) => ({ x: xFor(p.date), y: yForScore(p.score), score: p.score }));
  const linePath = scoreCoords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${scoreCoords[scoreCoords.length - 1].x} ${height} L ${scoreCoords[0].x} ${height} Z`;
  const last = scoreCoords[scoreCoords.length - 1];
  const latestScore = scorePoints[scorePoints.length - 1].score;

  const maxStat = Math.max(1, ...statPoints.map((p) => p.value));
  // Capped, not just divided by point count — with only 1-2 weeks logged the
  // uncapped formula produced a single bar wide enough to look like a grey
  // rendering glitch instead of a bar chart.
  const barWidth =
    statPoints.length > 0 ? Math.min(10, Math.max(2, (width - padding * 2) / statPoints.length / 1.6)) : 0;
  // Bars stay visually secondary to the score line — capped at 40% of the plot height.
  const barMaxHeight = (height - padding * 2) * 0.4;

  const allDates = [...scorePoints.map((p) => p.date), ...statPoints.map((p) => p.date)].sort();
  const firstDate = allDates[0];
  const lastDate = allDates[allDates.length - 1];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <div className="flex w-6 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] text-muted-foreground">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        <div className="relative h-52 min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            <span className="h-px w-full bg-border/70" />
            <span className="h-px w-full bg-border/50" />
            <span className="h-px w-full bg-border/70" />
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {statPoints.map((p, i) => {
              const barHeight = (p.value / maxStat) * barMaxHeight;
              return (
                <motion.rect
                  key={i}
                  x={xFor(p.date) - barWidth / 2}
                  width={barWidth}
                  rx={1}
                  fill="var(--muted-foreground)"
                  opacity={0.22}
                  initial={{ height: 0, y: height - padding }}
                  animate={{ height: barHeight, y: height - padding - barHeight }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                />
              );
            })}

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
            {scoreCoords.map((c, i) => (
              <motion.circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={i === scoreCoords.length - 1 ? 2.4 : 1.6}
                fill="var(--primary)"
                stroke="var(--card)"
                strokeWidth={i === scoreCoords.length - 1 ? 1 : 0}
                vectorEffect="non-scaling-stroke"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
              />
            ))}
          </svg>
          <motion.div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[135%] whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm"
            style={{ left: `${last.x}%`, top: `${last.y}%` }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1 }}
          >
            {latestScore}/100
          </motion.div>
        </div>
      </div>
      <div className="flex justify-between pl-8 text-[10px] text-muted-foreground">
        <span>{shortDate(firstDate)}</span>
        <span>{shortDate(lastDate)}</span>
      </div>
      {statPoints.length > 0 && statLabel && (
        <p className="pl-8 text-xs text-muted-foreground">
          Ligne : ton Dating Score · Barres : {statLabel} déclarés chaque semaine.
        </p>
      )}
    </div>
  );
}
