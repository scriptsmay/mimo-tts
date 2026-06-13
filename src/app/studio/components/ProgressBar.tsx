'use client';

interface ProgressBarProps {
  current: number;
  max: number;
}

export function ProgressBar({ current, max }: ProgressBarProps) {
  const pct = Math.min((current / max) * 100, 100);
  const isNearLimit = pct > 80;

  return (
    <div className="h-1 bg-[var(--muted)]/20 rounded-full mt-1 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${isNearLimit ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
