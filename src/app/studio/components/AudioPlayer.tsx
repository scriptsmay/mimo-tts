"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, Download, RotateCcw } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string | null;
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
      setPlaying(false);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="px-5 py-5 border-b border-[var(--card-border)]">
      <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
        音频播放
      </div>

      {!audioUrl ? (
        <div className="text-[13px] text-[var(--muted-foreground)] text-center py-5">
          等待生成
        </div>
      ) : (
        <>
          <audio ref={audioRef} src={audioUrl} />
          <div className="flex items-center gap-3.5">
            <button
              onClick={toggle}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all duration-200 shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--secondary))",
                boxShadow: "0 2px 10px var(--accent-glow)",
              }}
            >
              {playing ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
            </button>
            <div className="flex-1">
              <div className="h-1 bg-[var(--muted)]/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : "0%",
                    background:
                      "linear-gradient(90deg, var(--accent), var(--secondary))",
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--muted-foreground)] mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={restart}
                className="p-2 hover:bg-[var(--muted)]/25 rounded-lg transition-colors text-[var(--muted-foreground)]"
                title="重新播放"
              >
                <RotateCcw size={14} />
              </button>
              <a
                href={audioUrl}
                download="mimo-tts-output.wav"
                className="p-2 hover:bg-[var(--muted)]/25 rounded-lg transition-colors text-[var(--muted-foreground)]"
                title="下载"
              >
                <Download size={14} />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
