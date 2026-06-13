"use client";

import { Wifi, WifiOff } from "lucide-react";
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
    <div className="flex items-center gap-4 px-6 py-3 border-b border-[var(--card-border)] bg-[var(--card)]/50">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted-foreground)]">Model</span>
        <span className="text-xs font-mono bg-[var(--muted)]/30 px-2 py-0.5 rounded">
          {MODEL_IDS[mode]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {ready === null ? (
          <span className="text-xs text-[var(--muted-foreground)]">检查中...</span>
        ) : ready ? (
          <>
            <Wifi size={14} className="text-[var(--success)]" />
            <span className="text-xs text-[var(--success)]">Provider 已连接</span>
          </>
        ) : (
          <>
            <WifiOff size={14} className="text-[var(--error)]" />
            <span className="text-xs text-[var(--error)]">Provider 未配置</span>
          </>
        )}
      </div>
    </div>
  );
}
