export type Gender = 'female' | 'male';

export interface Voice {
  id: string;
  name: string;
  language: 'zh' | 'en';
  gender: Gender;
  style: string;
  previewText: string;
  previewContext: string;
}

export interface TextTag {
  label: string;
  value: string;
  target: 'text';
  presetOnly?: boolean;
}

export type TTSMode = 'preset' | 'design' | 'clone';

export interface TTSFormData {
  mode: TTSMode;
  text: string;
  context: string;
  voice?: string;
  voiceSample?: File;
}

export interface ASRFormData {
  audioFile: File;
  language: string;
  prompt: string;
  responseFormat: 'verbose_json' | 'text';
  timestampGranularity: 'segment' | 'word';
}

export interface ASRSegment {
  start: number;
  end: number;
  text: string;
}

export interface ASRResponse {
  text: string;
  segments?: ASRSegment[];
}

export interface HistoryItem {
  id: string;
  mode: TTSMode | 'asr';
  text: string;
  voice?: string;
  context?: string;
  audioUrl?: string;
  result?: string;
  timestamp: number;
}

export interface ModelInfo {
  id: string;
  mode: string;
  name: string;
}
