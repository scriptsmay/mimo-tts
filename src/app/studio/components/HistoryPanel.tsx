"use client";

import { Play, Trash2, Clock } from "lucide-react";
import type { HistoryItem } from "@/types";

interface HistoryPanelProps {
  items: HistoryItem[];
  playingItemId: string | null;
  onPlay: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryPanel({
  items,
  playingItemId,
  onPlay,
  onClear,
}: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 px-5 py-5">
        <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
          历史记录
        </div>
        <div className="text-[13px] text-[var(--muted-foreground)] text-center py-6">
          暂无历史记录
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)]">
        <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          历史记录
        </span>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-[var(--muted)]/25 rounded-lg transition-colors text-[var(--muted-foreground)]"
          title="清空历史"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => {
          const isPlaying = playingItemId === item.id;
          return (
            <div
              key={item.id}
              className={`px-5 py-3 border-b border-[var(--card-border)]/60 group transition-all duration-200 ${
                isPlaying
                  ? "bg-[var(--accent)]/8 border-l-2 border-l-[var(--accent)]"
                  : "hover:bg-[var(--muted)]/8 border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onPlay(item)}
                  className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
                    isPlaying
                      ? "opacity-100 text-[var(--accent)] bg-[var(--accent)]/20"
                      : "opacity-0 group-hover:opacity-100 text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20"
                  }`}
                >
                  {isPlaying ? (
                    <div className="flex items-center gap-[2px]">
                      <span className="w-[2px] h-3 bg-[var(--accent)] rounded-full animate-pulse" />
                      <span className="w-[2px] h-2 bg-[var(--accent)] rounded-full animate-pulse [animation-delay:0.15s]" />
                      <span className="w-[2px] h-3.5 bg-[var(--accent)] rounded-full animate-pulse [animation-delay:0.3s]" />
                    </div>
                  ) : (
                    <Play size={10} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[12px] truncate leading-relaxed ${
                      isPlaying ? "text-[var(--accent)] font-medium" : ""
                    }`}
                  >
                    {item.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded">
                      {item.voice || item.mode}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
