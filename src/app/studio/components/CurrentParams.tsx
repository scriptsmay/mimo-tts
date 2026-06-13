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
    <div className="px-5 py-5 border-b border-[var(--card-border)]">
      <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
        当前参数
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[var(--muted-foreground)]">
            模式
          </span>
          <span className="text-[13px] font-medium">
            {MODE_LABELS[mode]}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[var(--muted-foreground)]">
            模型
          </span>
          <span className="text-[12px] font-mono bg-[var(--muted)]/25 px-2.5 py-1 rounded-md text-[var(--foreground)]">
            {MODEL_IDS[mode]}
          </span>
        </div>

        {voice && mode === "preset" && (
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--muted-foreground)]">
              音色
            </span>
            <span className="text-[12px] bg-[var(--accent)]/15 text-[var(--accent)] px-2.5 py-1 rounded-md font-medium">
              {voice}
            </span>
          </div>
        )}

        {context && (
          <div className="mt-1">
            <div className="text-[11px] text-[var(--muted-foreground)] mb-1.5">
              控制指令
            </div>
            <div className="text-[12px] text-[var(--muted-foreground)] leading-relaxed bg-[var(--muted)]/12 px-3 py-2.5 rounded-lg border border-[var(--card-border)] line-clamp-2">
              {context}
            </div>
          </div>
        )}

        <div className="pt-1">
          {generating ? (
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse"
              />
              <span className="text-[12px] text-[var(--warning)] font-medium">
                生成中...
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
              <span className="text-[12px] text-[var(--muted-foreground)]">
                等待生成
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
