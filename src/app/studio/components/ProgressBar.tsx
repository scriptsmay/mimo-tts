"use client";

interface ProgressBarProps {
  current: number;
  max: number;
}

export function ProgressBar({ current, max }: ProgressBarProps) {
  const pct = Math.min((current / max) * 100, 100);
  const isNearLimit = pct > 80;

  return (
    <div className="h-[3px] bg-[var(--muted)]/20 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${pct}%`,
          background: isNearLimit
            ? "var(--warning)"
            : "linear-gradient(90deg, var(--accent), var(--secondary))",
        }}
      />
    </div>
  );
}
