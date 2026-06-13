"use client";

import { Upload, X, Music } from "lucide-react";
import { useRef } from "react";
import { APP_CONFIG } from "@/lib/config";

interface VoiceSampleUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const ACCEPT =
  ".mp3,.wav,.m4a,.mp4,.flac,.ogg,.oga,.webm,.mpga,audio/*";

export function VoiceSampleUpload({
  file,
  onChange,
}: VoiceSampleUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const maxBytes = APP_CONFIG.maxVoiceSampleMb * 1024 * 1024;
    if (f.size > maxBytes) {
      alert(`文件不能超过 ${APP_CONFIG.maxVoiceSampleMb} MB`);
      return;
    }
    onChange(f);
  };

  return (
    <div>
      <label className="text-[13px] font-semibold mb-3 block">
        声音样本
      </label>
      {file ? (
        <div className="flex items-center gap-3 px-4 py-3.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "rgba(124, 92, 252, 0.12)" }}
          >
            <Music size={16} className="text-[var(--accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] truncate font-medium">{file.name}</div>
            <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
          <button
            onClick={() => onChange(null)}
            className="p-1.5 hover:bg-[var(--muted)]/30 rounded-lg transition-colors"
          >
            <X size={16} className="text-[var(--muted-foreground)]" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-8 border-2 border-dashed border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] transition-all duration-200 flex flex-col items-center gap-3 bg-[var(--card)]/30 hover:bg-[var(--card)]/60"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124, 92, 252, 0.1)" }}
          >
            <Upload size={22} className="text-[var(--accent)]" />
          </div>
          <div className="text-center">
            <span className="text-[13px] text-[var(--muted-foreground)] block">
              上传声音样本（最大 {APP_CONFIG.maxVoiceSampleMb} MB）
            </span>
            <span className="text-[11px] text-[var(--muted)] block mt-1">
              mp3, wav, m4a, flac, ogg, webm
            </span>
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
