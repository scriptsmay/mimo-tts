"use client";

import { CONTEXT_PRESETS } from "@/lib/context-presets";
import type { TTSMode } from "@/types";

interface ContextControlProps {
  mode: TTSMode;
  value: string;
  onChange: (value: string) => void;
}

export function ContextControl({
  mode,
  value,
  onChange,
}: ContextControlProps) {
  const presets = CONTEXT_PRESETS[mode] || [];

  return (
    <div>
      <label className="text-[13px] font-semibold mb-3 block">
        自然语言控制
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="描述期望的语音风格..."
        className="w-full h-24 bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-4 py-3.5 text-[13px] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)] transition-all duration-200 placeholder:text-[var(--muted)]"
      />
      {presets.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-[11px] text-[var(--muted-foreground)]">
            声线预设
          </div>
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => onChange(preset)}
              className="w-full text-left text-[12px] px-4 py-2.5 rounded-lg bg-[var(--muted)]/15 hover:bg-[var(--muted)]/30 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all duration-200 line-clamp-1 border border-[var(--card-border)] hover:border-[var(--card-border-hover)]"
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
