"use client";

import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileAudio,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import type { ASRResponse } from "@/types";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { value: "auto", label: "自动" },
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
];

export function ASRPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("auto");
  const [prompt, setPrompt] = useState("");
  const [responseFormat, setResponseFormat] = useState<
    "verbose_json" | "text"
  >("verbose_json");
  const [timestampGranularity, setTimestampGranularity] = useState<
    "segment" | "word"
  >("segment");
  const [result, setResult] = useState<ASRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxBytes = APP_CONFIG.maxAsrFileMb * 1024 * 1024;
    if (f.size > maxBytes) {
      setError(`文件不能超过 ${APP_CONFIG.maxAsrFileMb} MB`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const handleRecognize = async () => {
    if (!file || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.set("audioFile", file);
    formData.set("language", language);
    formData.set("prompt", prompt);
    formData.set("responseFormat", responseFormat);
    formData.set("timestampGranularity", timestampGranularity);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/asr", {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "识别失败");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("已取消识别");
      } else {
        setError(err instanceof Error ? err.message : "识别失败");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleCopy = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
      {/* File Upload */}
      <div>
        <label className="text-[13px] font-semibold mb-3 block">
          音频文件
        </label>
        {file ? (
          <div className="flex items-center gap-3 px-4 py-3.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: "rgba(124, 92, 252, 0.12)" }}
            >
              <FileAudio size={16} className="text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] truncate font-medium">
                {file.name}
              </div>
              <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
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
            <span className="text-[13px] text-[var(--muted-foreground)]">
              上传音频/视频文件（最大 {APP_CONFIG.maxAsrFileMb} MB）
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Language & Format */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="text-[13px] font-semibold mb-3 block">
            语言
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[var(--accent)] transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[13px] font-semibold mb-3 block">
            输出格式
          </label>
          <select
            value={responseFormat}
            onChange={(e) =>
              setResponseFormat(
                e.target.value as "verbose_json" | "text"
              )
            }
            className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[var(--accent)] transition-colors"
          >
            <option value="verbose_json">详细 JSON</option>
            <option value="text">纯文本</option>
          </select>
        </div>
      </div>

      {/* Timestamp Granularity */}
      <div>
        <label className="text-[13px] font-semibold mb-3 block">
          时间粒度
        </label>
        <div className="flex gap-2 bg-[var(--card)] rounded-xl p-1 border border-[var(--card-border)]">
          {(["segment", "word"] as const).map((g) => {
            const isActive = timestampGranularity === g;
            return (
              <button
                key={g}
                onClick={() => setTimestampGranularity(g)}
                className={cn(
                  "flex-1 py-2.5 text-[13px] rounded-[10px] transition-all duration-200",
                  isActive ? "text-white font-semibold" : "text-[var(--muted-foreground)]"
                )}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, var(--accent), var(--secondary))",
                        boxShadow: "0 2px 8px var(--accent-glow)",
                      }
                    : {}
                }
              >
                {g === "segment" ? "段落" : "单词"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Prompt */}
      <div>
        <label className="text-[13px] font-semibold mb-3 block">
          提示词（可选）
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="辅助识别的专业术语或上下文..."
          className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:border-[var(--accent)] transition-all duration-200 placeholder:text-[var(--muted)]"
        />
      </div>

      {/* Action Button */}
      {loading ? (
        <button
          onClick={() => abortRef.current?.abort()}
          className="w-full py-3.5 bg-[var(--error)] hover:bg-[var(--error)]/80 text-white rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 text-[14px] font-semibold"
        >
          <Loader2 size={16} className="animate-spin" />
          取消识别
        </button>
      ) : (
        <button
          onClick={handleRecognize}
          disabled={!file}
          className="w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 text-[15px] font-semibold"
          style={{
            background: "linear-gradient(135deg, var(--accent), #9b7bfc)",
            boxShadow: !file
              ? "none"
              : "0 4px 20px var(--accent-glow), 0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          开始识别
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="text-[var(--error)] text-sm bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold">识别结果</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[12px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--muted)]/20"
            >
              {copied ? (
                <Check size={12} className="text-[var(--success)]" />
              ) : (
                <Copy size={12} />
              )}
              <span className={copied ? "text-[var(--success)]" : ""}>
                {copied ? "已复制" : "复制"}
              </span>
            </button>
          </div>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 text-[13px] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
            {result.text}
          </div>
          {result.segments && result.segments.length > 0 && (
            <div>
              <label className="text-[11px] text-[var(--muted-foreground)] mb-2 block font-medium">
                时间轴
              </label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {result.segments.map((seg, i) => (
                  <div
                    key={i}
                    className="flex gap-3 text-[12px] px-3.5 py-2.5 bg-[var(--muted)]/10 rounded-lg border border-[var(--card-border)]/50"
                  >
                    <span className="text-[var(--accent)] font-mono w-24 shrink-0">
                      {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                    </span>
                    <span className="text-[var(--foreground)]">
                      {seg.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
