'use client';

import type { TTSMode } from '@/types';
import { cn } from '@/lib/utils';

interface ModeTabsProps {
  mode: TTSMode;
  onChange: (mode: TTSMode) => void;
}

const TABS = [
  { value: 'preset' as const, label: '文字转语音' },
  { value: 'design' as const, label: '音色设计' },
  { value: 'clone' as const, label: '声音克隆' },
];

export function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="flex gap-1 bg-[var(--card)] rounded-lg p-1">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex-1 py-2 text-sm rounded-md transition-colors',
            mode === tab.value
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
