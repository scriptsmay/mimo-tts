export interface TTSRequest {
  model: string;
  input: string;
  context: string;
  voice?: string;
  voiceSample?: Buffer;
  responseFormat?: "wav" | "mp3" | "opus";
}

export interface TTSResponse {
  audio: Buffer;
  model: string;
  duration?: number;
}

export interface ASRRequest {
  model: string;
  audioStream: ReadableStream;
  audioFileName: string;
  audioMimeType: string;
  language?: string;
  prompt?: string;
  responseFormat?: "verbose_json" | "text";
  timestampGranularity?: "segment" | "word";
  signal?: AbortSignal;
}

export interface ASRResponse {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  words?: Array<{
    start: number;
    end: number;
    word: string;
  }>;
}

export interface MimoProvider {
  textToSpeech(request: TTSRequest): Promise<TTSResponse>;
  speechToText(request: ASRRequest): Promise<ASRResponse>;
}
