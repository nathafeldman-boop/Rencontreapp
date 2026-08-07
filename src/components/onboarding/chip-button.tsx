"use client";

export function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
        active ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
