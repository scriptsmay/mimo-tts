"use client";

import { User } from "lucide-react";
import type { Voice } from "@/types";
import { cn } from "@/lib/utils";

interface VoiceSelectorProps {
  voices: Voice[];
  selected: Voice;
  onSelect: (voice: Voice) => void;
}

export function VoiceSelector({
  voices,
  selected,
  onSelect,
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
          onSelect={onSelect}
        />
        <VoiceGroup
          label="English"
          voices={enVoices}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

function VoiceGroup({
  label,
  voices,
  selected,
  onSelect,
}: {
  label: string;
  voices: Voice[];
  selected: Voice;
  onSelect: (v: Voice) => void;
}) {
  return (
    <div>
      <div className="text-[11px] text-[var(--muted-foreground)] mb-2.5 font-medium">
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {voices.map((voice) => {
          const isSelected = selected.id === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => onSelect(voice)}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl text-left text-sm transition-all duration-200 border-[1.5px]",
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent)]/8"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--card-border-hover)]"
              )}
              style={
                isSelected
                  ? { boxShadow: "0 0 0 1px rgba(124, 92, 252, 0.2)" }
                  : {}
              }
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0",
                  voice.gender === "female"
                    ? "bg-[rgba(236,72,153,0.12)] text-[#f472b6]"
                    : "bg-[rgba(96,165,250,0.12)] text-[#60a5fa]"
                )}
              >
                <User size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">
                  {voice.name}
                </div>
                <div className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
                  {voice.style}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
