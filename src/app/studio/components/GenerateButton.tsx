"use client";

import { Loader2, Square, Play } from "lucide-react";

interface GenerateButtonProps {
  generating: boolean;
  disabled: boolean;
  onGenerate: () => void;
  onStop: () => void;
}

export function GenerateButton({
  generating,
  disabled,
  onGenerate,
  onStop,
}: GenerateButtonProps) {
  if (generating) {
    return (
      <button
        onClick={onStop}
        className="w-full py-3 bg-[var(--error)] hover:bg-[var(--error)]/80 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Square size={16} />
        停止生成
      </button>
    );
  }

  return (
    <button
      onClick={onGenerate}
      disabled={disabled}
      className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      <Play size={16} />
      生成语音
    </button>
  );
}
