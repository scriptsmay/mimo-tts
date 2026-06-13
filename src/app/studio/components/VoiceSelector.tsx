"use client";

import { User, Headphones, Loader2 } from "lucide-react";
import type { Voice } from "@/types";
import { cn } from "@/lib/utils";

interface VoiceSelectorProps {
  voices: Voice[];
  selected: Voice;
  previewingVoiceId: string | null;
  onSelect: (voice: Voice) => void;
  onPreview: (voice: Voice) => void;
}

export function VoiceSelector({
  voices,
  selected,
  previewingVoiceId,
  onSelect,
  onPreview,
}: VoiceSelectorProps) {
  const zhVoices = voices.filter((v) => v.language === "zh");
  const enVoices = voices.filter((v) => v.language === "en");

  return (
    <div>
      <label className="text-[13px] font-semibold mb-3 block">
        选择音色
      </label>
      <div className="space-y-4">
        <VoiceGroup
          label="中文"
          voices={zhVoices}
          selected={selected}
          previewingVoiceId={previewingVoiceId}
          onSelect={onSelect}
          onPreview={onPreview}
        />
        <VoiceGroup
          label="English"
          voices={enVoices}
          selected={selected}
          previewingVoiceId={previewingVoiceId}
          onSelect={onSelect}
          onPreview={onPreview}
        />
      </div>
    </div>
  );
}

function VoiceGroup({
  label,
  voices,
  selected,
  previewingVoiceId,
  onSelect,
  onPreview,
}: {
  label: string;
  voices: Voice[];
  selected: Voice;
  previewingVoiceId: string | null;
  onSelect: (v: Voice) => void;
  onPreview: (v: Voice) => void;
}) {
  return (
    <div>
      <div className="text-[11px] text-[var(--muted-foreground)] mb-2.5 font-medium">
        {label}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {voices.map((voice) => {
          const isSelected = selected.id === voice.id;
          const isPreviewing = previewingVoiceId === voice.id;
          return (
            <div
              key={voice.id}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl text-center text-sm transition-all duration-200 border-[1.5px] cursor-pointer",
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent)]/8"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--card-border-hover)]"
              )}
              style={
                isSelected
                  ? { boxShadow: "0 0 0 1px rgba(124, 92, 252, 0.2)" }
                  : {}
              }
              onClick={() => onSelect(voice)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  voice.gender === "female"
                    ? "bg-[rgba(236,72,153,0.12)] text-[#f472b6]"
                    : "bg-[rgba(96,165,250,0.12)] text-[#60a5fa]"
                )}
              >
                <User size={16} />
              </div>
              <div className="min-w-0 w-full">
                <div className="text-[13px] font-semibold truncate">
                  {voice.name}
                </div>
                <div className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                  {voice.style}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(voice);
                }}
                disabled={isPreviewing}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0",
                  isPreviewing
                    ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "bg-[var(--muted)]/25 hover:bg-[var(--accent)]/20 text-[var(--muted-foreground)] hover:text-[var(--accent)]"
                )}
                title={`试听 ${voice.name}`}
              >
                {isPreviewing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Headphones size={14} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
