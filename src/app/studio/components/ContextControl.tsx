"use client";

import { CONTEXT_PRESETS } from "@/lib/context-presets";
import type { TTSMode } from "@/types";

interface ContextControlProps {
  mode: TTSMode;
  value: string;
  onChange: (value: string) => void;
}

export function ContextControl({ mode, value, onChange }: ContextControlProps) {
  const presets = CONTEXT_PRESETS[mode] || [];

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        自然语言控制
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="描述期望的语音风格..."
        className="w-full h-24 bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
      {presets.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-xs text-[var(--muted-foreground)]">
            声线预设
          </div>
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => onChange(preset)}
              className="w-full text-left text-xs p-2 rounded bg-[var(--muted)]/20 hover:bg-[var(--muted)]/40 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors line-clamp-1"
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
