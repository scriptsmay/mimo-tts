'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileAudio, Loader2, Copy, Check } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import type { ASRResponse } from '@/types';

const LANGUAGES = [
  { value: 'auto', label: '自动' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
];

export function ASRPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('auto');
  const [prompt, setPrompt] = useState('');
  const [responseFormat, setResponseFormat] = useState<'verbose_json' | 'text'>('verbose_json');
  const [timestampGranularity, setTimestampGranularity] = useState<'segment' | 'word'>('segment');
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
    formData.set('audioFile', file);
    formData.set('language', language);
    formData.set('prompt', prompt);
    formData.set('responseFormat', responseFormat);
    formData.set('timestampGranularity', timestampGranularity);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/asr', {
        method: 'POST',
        body: formData,
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '识别失败');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('已取消识别');
      } else {
        setError(err instanceof Error ? err.message : '识别失败');
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
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <label className="text-sm font-medium mb-2 block">音频文件</label>
        {file ? (
          <div className="flex items-center gap-3 p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
            <FileAudio size={18} className="text-[var(--accent)]" />
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{file.name}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
            </div>
            <button onClick={() => setFile(null)} className="p-1 hover:bg-[var(--muted)]/30 rounded">
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
              上传音频/视频文件（最大 {APP_CONFIG.maxAsrFileMb} MB）
            </span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="audio/*,video/*" onChange={handleFileChange} className="hidden" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">语言</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">输出格式</label>
          <select
            value={responseFormat}
            onChange={(e) => setResponseFormat(e.target.value as 'verbose_json' | 'text')}
            className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="verbose_json">详细 JSON</option>
            <option value="text">纯文本</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">时间粒度</label>
        <div className="flex gap-2">
          {(['segment', 'word'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setTimestampGranularity(g)}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                timestampGranularity === g
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--muted)]/30 text-[var(--muted-foreground)]'
              }`}
            >
              {g === 'segment' ? '段落' : '单词'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">提示词（可选）</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="辅助识别的专业术语或上下文..."
          className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {loading ? (
        <button
          onClick={() => abortRef.current?.abort()}
          className="w-full py-3 bg-[var(--error)] hover:bg-[var(--error)]/80 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          取消识别
        </button>
      ) : (
        <button
          onClick={handleRecognize}
          disabled={!file}
          className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          开始识别
        </button>
      )}

      {error && <div className="text-[var(--error)] text-sm">{error}</div>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">识别结果</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
            {result.text}
          </div>
          {result.segments && result.segments.length > 0 && (
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">时间轴</label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.segments.map((seg, i) => (
                  <div key={i} className="flex gap-3 text-xs p-2 bg-[var(--muted)]/10 rounded">
                    <span className="text-[var(--accent)] font-mono w-20 shrink-0">
                      {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                    </span>
                    <span>{seg.text}</span>
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
