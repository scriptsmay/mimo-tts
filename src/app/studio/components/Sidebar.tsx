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
      {/* Brand Header */}
      <div className="px-6 pt-7 pb-5 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), var(--secondary))",
              boxShadow: "0 2px 12px var(--accent-glow)",
            }}
          >
            M
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight">MimoTTS</h1>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              Studio
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-all duration-200",
                isActive
                  ? "bg-[var(--sidebar-active)] text-[var(--accent)] font-semibold border border-[rgba(124,92,252,0.2)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/20 border border-transparent"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[var(--card-border)] flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
        <span className="text-[11px] text-[var(--muted-foreground)]">
          Self-hosted
        </span>
      </div>
    </div>
  );
}
