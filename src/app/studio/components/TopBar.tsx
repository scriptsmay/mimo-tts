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
    <div
      className="h-[52px] border-b border-[var(--card-border)] flex items-center px-7 gap-3 text-[13px]"
      style={{ background: "rgba(21, 19, 32, 0.5)" }}
    >
      <span className="font-semibold">MimoTTS Studio</span>
      <span className="text-[var(--muted)] text-[11px]">·</span>
      {breadcrumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-3">
          {i > 0 && (
            <span className="text-[var(--muted)] text-[11px]">›</span>
          )}
          <span
            className={
              voice && crumb === voice
                ? "text-[var(--accent)] font-medium"
                : "text-[var(--muted-foreground)]"
            }
          >
            {crumb}
          </span>
        </span>
      ))}
    </div>
  );
}
