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
      <label className="text-sm font-medium mb-2 block">声音样本</label>
      {file ? (
        <div className="flex items-center gap-3 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
          <Music size={18} className="text-[var(--accent)]" />
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{file.name}</div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
          <button
            onClick={() => onChange(null)}
            className="p-1 hover:bg-[var(--muted)]/30 rounded"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full p-4 border-2 border-dashed border-[var(--card-border)] rounded-lg hover:border-[var(--accent)] transition-colors flex flex-col items-center gap-2"
        >
          <Upload size={24} className="text-[var(--muted-foreground)]" />
          <span className="text-sm text-[var(--muted-foreground)]">
            上传声音样本（最大 {APP_CONFIG.maxVoiceSampleMb} MB）
          </span>
          <span className="text-xs text-[var(--muted)]">
            mp3, wav, m4a, flac, ogg, webm
          </span>
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
