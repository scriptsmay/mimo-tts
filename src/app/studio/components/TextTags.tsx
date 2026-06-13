"use client";

import { TEXT_TAGS } from "@/lib/text-tags";
import type { TTSMode } from "@/types";

interface TextTagsProps {
  mode: TTSMode;
  onInsert: (tagValue: string) => void;
}

export function TextTags({ mode, onInsert }: TextTagsProps) {
  const tags = TEXT_TAGS.filter(
    (tag) => !tag.presetOnly || mode === "preset"
  );

  return (
    <div>
      <label className="text-[13px] font-semibold mb-3 block">
        文本标签
      </label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.label}
            onClick={() => onInsert(tag.value)}
            className="px-4 py-2 text-[12px] bg-[var(--muted)]/20 hover:bg-[var(--muted)]/35 rounded-lg transition-all duration-200 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--card-border)] hover:border-[var(--card-border-hover)]"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
