import { NextResponse } from 'next/server';
import { PRESET_VOICES } from '@/lib/voices';

export async function GET() {
  return NextResponse.json({
    voices: PRESET_VOICES,
    models: [
      { id: 'mimo-v2.5-tts', mode: 'preset', name: '预置音色 TTS' },
      { id: 'mimo-v2.5-tts-voicedesign', mode: 'design', name: '音色设计' },
      { id: 'mimo-v2.5-tts-voiceclone', mode: 'clone', name: '声音克隆' },
      { id: 'mimo-v2.5-asr', mode: 'asr', name: '语音转文字' },
    ],
  });
}
