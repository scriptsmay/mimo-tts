"use client";

import { Clock, Play, Trash2 } from "lucide-react";
import type { HistoryItem } from "@/types";

interface HistoryPanelProps {
  items: HistoryItem[];
  onPlay: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryPanel({ items, onPlay, onClear }: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 p-4">
        <div className="text-sm text-[var(--muted-foreground)] text-center py-6">
          暂无历史记录
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)]">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">
          历史记录
        </span>
        <button
          onClick={onClear}
          className="p-1 hover:bg-[var(--muted)]/30 rounded text-[var(--muted-foreground)]"
          title="清空历史"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 border-b border-[var(--card-border)] hover:bg-[var(--muted)]/10 group"
          >
            <div className="flex items-start gap-2">
              <button
                onClick={() => onPlay(item)}
                className="mt-0.5 p-1 rounded hover:bg-[var(--muted)]/30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play size={12} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate">{item.text}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {item.voice || item.mode}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
