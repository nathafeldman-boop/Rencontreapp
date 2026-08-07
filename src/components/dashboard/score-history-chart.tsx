"use client";

interface ScorePoint {
  date: string;
  score: number;
}

/** Lightweight inline-SVG line chart — no charting dependency needed for a single sparkline. */
export function ScoreHistoryChart({ points }: { points: ScorePoint[] }) {
  if (points.length < 2) {
    return (
      <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Run a few more analyses to see your progress over time.
      </p>
    );
  }

  const width = 100;
  const height = 100;
  const padding = 8;
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

  return (
    <div className="h-32 w-full">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="score-history-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#score-history-fill)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={1.6} fill="var(--primary)" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
}
