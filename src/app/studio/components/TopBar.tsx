"use client";

import type { TTSMode } from "@/types";

interface TopBarProps {
  mode: TTSMode | "asr";
  voice?: string;
}

const MODE_LABELS: Record<string, string> = {
  preset: "Preset Voice",
  design: "Voice Design",
  clone: "Voice Clone",
  asr: "ASR",
};

export function TopBar({ mode, voice }: TopBarProps) {
  const breadcrumbs = [MODE_LABELS[mode], "MiMo V2.5"];
  if (voice) breadcrumbs.splice(1, 0, voice);
  breadcrumbs.push("WAV");

  return (
    <div className="h-12 border-b border-[var(--card-border)] flex items-center px-4 bg-[var(--card)]">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">MimoTTS Studio</span>
        <span className="text-[var(--muted)]">·</span>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[var(--muted)]">›</span>}
            <span className="text-[var(--muted-foreground)]">{crumb}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
