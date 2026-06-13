"use client";

import type { TTSMode } from "@/types";

interface CurrentParamsProps {
  mode: TTSMode | "asr";
  voice?: string;
  context: string;
  generating: boolean;
}

const MODE_LABELS: Record<string, string> = {
  preset: "文字转语音",
  design: "音色设计",
  clone: "声音克隆",
  asr: "语音转文字",
};

const MODEL_IDS: Record<string, string> = {
  preset: "mimo-v2.5-tts",
  design: "mimo-v2.5-tts-voicedesign",
  clone: "mimo-v2.5-tts-voiceclone",
  asr: "mimo-v2.5-asr",
};

export function CurrentParams({
  mode,
  voice,
  context,
  generating,
}: CurrentParamsProps) {
  return (
    <div className="p-4 border-b border-[var(--card-border)]">
      <div className="text-xs font-medium text-[var(--muted-foreground)] mb-3">
        当前参数
      </div>
      <div className="space-y-2">
        <div className="text-sm font-medium">{MODE_LABELS[mode]}</div>
        <div className="flex gap-2">
          <span className="text-xs bg-[var(--muted)]/30 px-2 py-0.5 rounded font-mono">
            {MODEL_IDS[mode]}
          </span>
          {voice && mode === "preset" && (
            <span className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-0.5 rounded">
              {voice}
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--muted-foreground)] line-clamp-3">
          {context}
        </div>
        <div className="text-xs">
          {generating ? (
            <span className="text-[var(--warning)]">生成中...</span>
          ) : (
            <span className="text-[var(--muted-foreground)]">等待生成</span>
          )}
        </div>
      </div>
    </div>
  );
}
