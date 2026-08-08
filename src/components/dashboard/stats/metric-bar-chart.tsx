"use client";

import { motion } from "framer-motion";

/** Lightweight horizontal bar chart, no charting dependency — same "no library needed for simple shapes" approach as ScoreHistoryChart. */
export function MetricBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-muted-foreground">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-brand-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-medium">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
