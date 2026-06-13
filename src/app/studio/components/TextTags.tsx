'use client';

import { TEXT_TAGS } from '@/lib/text-tags';
import type { TTSMode } from '@/types';

interface TextTagsProps {
  mode: TTSMode;
  onInsert: (tagValue: string) => void;
}

export function TextTags({ mode, onInsert }: TextTagsProps) {
  const tags = TEXT_TAGS.filter((tag) => !tag.presetOnly || mode === 'preset');

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">文本标签</label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.label}
            onClick={() => onInsert(tag.value)}
            className="px-3 py-1.5 text-xs bg-[var(--muted)]/30 hover:bg-[var(--muted)]/50 rounded-md transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
