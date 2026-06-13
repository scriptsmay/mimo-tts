"use client";

import { Mic, Wand2, Copy, Speech } from "lucide-react";
import type { TTSMode } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeMode: TTSMode | "asr";
  onModeChange: (mode: TTSMode | "asr") => void;
}

const NAV_ITEMS = [
  { mode: "preset" as TTSMode, label: "文字转语音", icon: Mic },
  { mode: "design" as TTSMode, label: "音色设计", icon: Wand2 },
  { mode: "clone" as TTSMode, label: "声音克隆", icon: Copy },
  { mode: "asr" as const, label: "语音转文字", icon: Speech },
];

export function Sidebar({ activeMode, onModeChange }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--card-border)]">
        <h1 className="text-lg font-bold">MimoTTS Studio</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/30"
              )}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[var(--card-border)] text-xs text-[var(--muted-foreground)]">
        Self-hosted TTS Tool
      </div>
    </div>
  );
}
