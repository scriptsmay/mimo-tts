"use client";

import type { TTSMode } from "@/types";
import { cn } from "@/lib/utils";

interface ModeTabsProps {
  mode: TTSMode;
  onChange: (mode: TTSMode) => void;
}

const TABS = [
  { value: "preset" as const, label: "预设音色" },
  { value: "design" as const, label: "音色设计" },
  { value: "clone" as const, label: "声音克隆" },
];

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex gap-1 bg-[var(--card)] rounded-xl p-1 border border-[var(--card-border)]">
      {TABS.map((tab) => {
        const isActive = mode === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex-1 py-2.5 text-[13px] rounded-[10px] transition-all duration-200",
              isActive
                ? "text-white font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, var(--accent), var(--secondary))",
                    boxShadow: "0 2px 8px var(--accent-glow)",
                  }
                : {}
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
