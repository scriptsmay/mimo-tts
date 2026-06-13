"use client";

import { User, Volume2 } from "lucide-react";
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
      <label className="text-sm font-medium mb-2 block">选择音色</label>
      <div className="space-y-3">
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
      <div className="text-xs text-[var(--muted-foreground)] mb-1.5">
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onSelect(voice)}
            className={cn(
              "flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors border",
              selected.id === voice.id
                ? "border-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--card-border)] hover:border-[var(--muted)]"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                voice.gender === "female"
                  ? "bg-pink-500/20 text-pink-400"
                  : "bg-blue-500/20 text-blue-400"
              )}
            >
              {voice.gender === "female" ? (
                <User size={14} />
              ) : (
                <User size={14} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{voice.name}</div>
              <div className="text-xs text-[var(--muted-foreground)] truncate">
                {voice.style}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
