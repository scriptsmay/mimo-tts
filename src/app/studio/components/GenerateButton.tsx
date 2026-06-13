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
        className="w-full py-3.5 bg-[var(--error)] hover:bg-[var(--error)]/80 text-white rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 text-[14px] font-semibold"
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
      className="w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 text-[15px] font-semibold"
      style={{
        background: "linear-gradient(135deg, var(--accent), #9b7bfc)",
        boxShadow: disabled
          ? "none"
          : "0 4px 20px var(--accent-glow), 0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      <Play size={17} />
      生成语音
    </button>
  );
}
