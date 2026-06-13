"use client";

import { useState, useCallback, useRef } from "react";
import { AppShell } from "./components/AppShell";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { StatusGrid } from "./components/StatusGrid";
import { ModeTabs } from "./components/ModeTabs";
import { TextInput } from "./components/TextInput";
import { TextTags } from "./components/TextTags";
import { VoiceSelector } from "./components/VoiceSelector";
import { VoiceSampleUpload } from "./components/VoiceSampleUpload";
import { ContextControl } from "./components/ContextControl";
import { GenerateButton } from "./components/GenerateButton";
import { AudioPlayer } from "./components/AudioPlayer";
import { HistoryPanel } from "./components/HistoryPanel";
import { CurrentParams } from "./components/CurrentParams";
import { ASRPanel } from "./components/ASRPanel";
import type { TTSMode, HistoryItem, Voice } from "@/types";
import { PRESET_VOICES } from "@/lib/voices";
import { DEFAULT_CONTEXT } from "@/lib/context-presets";
import { base64ToUint8Array, generateId } from "@/lib/utils";

export default function StudioPage() {
  const [mode, setMode] = useState<TTSMode | "asr">("preset");
  const [text, setText] = useState("");
  const [context, setContext] = useState(DEFAULT_CONTEXT.preset);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PRESET_VOICES[0]);
  const [voiceSample, setVoiceSample] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("mimo-tts-history") || "[]");
    } catch {
      return [];
    }
  });

  const abortRef = useRef<AbortController | null>(null);

  const handleModeChange = useCallback(
    (newMode: TTSMode | "asr") => {
      setMode(newMode);
      if (newMode !== "asr") {
        setContext(DEFAULT_CONTEXT[newMode]);
      }
      setError(null);
    },
    []
  );

  const handleInsertTag = useCallback((tagValue: string) => {
    setText((prev) => prev + tagValue);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!text.trim() || generating) return;

    setGenerating(true);
    setError(null);
    setAudioUrl(null);

    const formData = new FormData();
    formData.set("mode", mode);
    formData.set("text", text);
    formData.set("context", context);
    if (mode === "preset") {
      formData.set("voice", selectedVoice.id);
    }
    if (mode === "clone" && voiceSample) {
      formData.set("voiceSample", voiceSample);
    }

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "合成失败");
      }

      const data = await res.json();
      const uint8 = new Uint8Array(base64ToUint8Array(data.audio));
      const blob = new Blob([uint8], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const item: HistoryItem = {
        id: generateId(),
        mode,
        text,
        voice: mode === "preset" ? selectedVoice.id : undefined,
        context,
        audioUrl: url,
        timestamp: Date.now(),
      };

      const newHistory = [item, ...history].slice(0, 50);
      setHistory(newHistory);
      localStorage.setItem("mimo-tts-history", JSON.stringify(newHistory));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("已取消生成");
      } else {
        setError(err instanceof Error ? err.message : "合成失败");
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [text, generating, mode, context, selectedVoice, voiceSample, history]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("mimo-tts-history");
  }, []);

  const handlePlayHistory = useCallback((item: HistoryItem) => {
    if (item.audioUrl) {
      setAudioUrl(item.audioUrl);
    }
  }, []);

  return (
    <AppShell
      sidebar={<Sidebar activeMode={mode} onModeChange={handleModeChange} />}
      topBar={
        <TopBar
          mode={mode}
          voice={mode === "preset" ? selectedVoice.name : undefined}
        />
      }
    >
      <div className="flex h-full">
        <div className="flex-1 flex flex-col overflow-hidden">
          <StatusGrid mode={mode} />
          {mode === "asr" ? (
            <ASRPanel />
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <ModeTabs mode={mode} onChange={handleModeChange} />
              <TextInput value={text} onChange={setText} />
              <TextTags mode={mode} onInsert={handleInsertTag} />
              {mode === "preset" && (
                <VoiceSelector
                  voices={PRESET_VOICES}
                  selected={selectedVoice}
                  onSelect={setSelectedVoice}
                />
              )}
              {mode === "clone" && (
                <VoiceSampleUpload
                  file={voiceSample}
                  onChange={setVoiceSample}
                />
              )}
              <ContextControl
                mode={mode}
                value={context}
                onChange={setContext}
              />
              <GenerateButton
                generating={generating}
                disabled={!text.trim()}
                onGenerate={handleGenerate}
                onStop={handleStop}
              />
              {error && (
                <div className="text-[var(--error)] text-sm">{error}</div>
              )}
            </div>
          )}
        </div>
        <div className="w-80 border-l border-[var(--card-border)] flex flex-col overflow-hidden">
          <CurrentParams
            mode={mode}
            voice={selectedVoice.name}
            context={context}
            generating={generating}
          />
          <AudioPlayer audioUrl={audioUrl} />
          <HistoryPanel
            items={history}
            onPlay={handlePlayHistory}
            onClear={handleClearHistory}
          />
        </div>
      </div>
    </AppShell>
  );
}
