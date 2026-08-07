"use client";

const LABELS: Record<number, string> = {
  1: "Pas confiant du tout",
  4: "Plutôt incertain",
  7: "Assez confiant",
  10: "Très confiant",
};

export function ConfidenceSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const nearestLabel = Object.keys(LABELS)
    .map(Number)
    .reduce((closest, key) => (Math.abs(key - value) < Math.abs(closest - value) ? key : closest));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{LABELS[nearestLabel]}</span>
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-primary-foreground">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Niveau de confiance"
        aria-valuetext={`${value} sur 10 — ${LABELS[nearestLabel]}`}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[oklch(0.62_0.22_15)]"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}
