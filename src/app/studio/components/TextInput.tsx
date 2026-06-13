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
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">合成文本</label>
        <span className="text-xs text-[var(--muted-foreground)]">
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
        className="w-full h-40 bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
      <ProgressBar current={value.length} max={APP_CONFIG.maxTextLength} />
    </div>
  );
}
