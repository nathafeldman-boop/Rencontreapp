interface SparklinePoint {
  date: string;
  value: number;
}

interface SparklineProps {
  points: SparklinePoint[];
  color: string;
  className?: string;
}

/** Static inline-SVG mini trend line — no chart dependency, no client JS (unlike ScoreHistoryChart, this never needs to animate). */
export function Sparkline({ points, color, className }: SparklineProps) {
  if (points.length < 2) return null;

  const width = 100;
  const height = 32;
  const max = Math.max(...points.map((p) => p.value), 1);

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - (p.value / max) * height;
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className ?? "h-8 w-full"}
      aria-hidden="true"
    >
      <path d={areaPath} fill={color} fillOpacity={0.12} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.75} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
