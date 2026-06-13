"use client";

import { APP_CONFIG } from "@/lib/config";
import { ProgressBar } from "./ProgressBar";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[13px] font-semibold">合成文本</label>
        <span className="text-[11px] text-[var(--muted-foreground)] bg-[var(--muted)]/20 px-2.5 py-1 rounded-md">
          {value.length} / {APP_CONFIG.maxTextLength}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= APP_CONFIG.maxTextLength) {
            onChange(e.target.value);
          }
        }}
        placeholder="输入要合成的文本..."
        className="w-full h-44 bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-4 py-4 text-[14px] leading-relaxed resize-none focus:outline-none focus:border-[var(--accent)] transition-all duration-200 placeholder:text-[var(--muted)]"
      />
      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1">
          <ProgressBar current={value.length} max={APP_CONFIG.maxTextLength} />
        </div>
      </div>
    </div>
  );
}
