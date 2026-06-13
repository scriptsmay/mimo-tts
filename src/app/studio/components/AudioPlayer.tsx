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

  if (!audioUrl) {
    return (
      <div className="p-4 border-b border-[var(--card-border)]">
        <div className="text-sm text-[var(--muted-foreground)] text-center py-6">
          等待生成
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-[var(--card-border)]">
      <audio ref={audioRef} src={audioUrl} />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] flex items-center justify-center text-white transition-colors"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-[var(--muted)]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all"
              style={{
                width: duration
                  ? `${(currentTime / duration) * 100}%`
                  : "0%",
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <button
          onClick={restart}
          className="p-2 hover:bg-[var(--muted)]/30 rounded"
          title="重新播放"
        >
          <RotateCcw size={14} />
        </button>
        <a
          href={audioUrl}
          download="mimo-tts-output.wav"
          className="p-2 hover:bg-[var(--muted)]/30 rounded"
          title="下载"
        >
          <Download size={14} />
        </a>
      </div>
    </div>
  );
}
