"use client";

import { WifiOff } from "lucide-react";
import type { TTSMode } from "@/types";
import { useEffect, useState } from "react";

interface StatusGridProps {
  mode: TTSMode | "asr";
}

const MODEL_IDS: Record<string, string> = {
  preset: "mimo-v2.5-tts",
  design: "mimo-v2.5-tts-voicedesign",
  clone: "mimo-v2.5-tts-voiceclone",
  asr: "mimo-v2.5-asr",
};

export function StatusGrid({ mode }: StatusGridProps) {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/ready")
      .then((r) => r.json())
      .then((d) => setReady(d.ready))
      .catch(() => setReady(false));
  }, []);

  return (
    <div className="flex items-center gap-6 px-8 py-3.5 border-b border-[var(--card-border)] bg-[var(--card)]/40">
      <div className="flex items-center gap-2.5">
        <span className="text-[12px] text-[var(--muted-foreground)]">
          Model
        </span>
        <span className="text-[12px] font-mono bg-[var(--muted)]/25 px-3 py-1 rounded-md text-[var(--muted-foreground)] border border-[var(--card-border)]">
          {MODEL_IDS[mode]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {ready === null ? (
          <span className="text-[12px] text-[var(--muted-foreground)]">
            检查中...
          </span>
        ) : ready ? (
          <>
            <div
              className="w-[7px] h-[7px] rounded-full bg-[var(--success)]"
              style={{ boxShadow: "0 0 8px rgba(52, 211, 153, 0.4)" }}
            />
            <span className="text-[12px] text-[var(--success)]">
              Provider 已连接
            </span>
          </>
        ) : (
          <>
            <WifiOff size={14} className="text-[var(--error)]" />
            <span className="text-[12px] text-[var(--error)]">
              Provider 未配置
            </span>
          </>
        )}
      </div>
    </div>
  );
}
