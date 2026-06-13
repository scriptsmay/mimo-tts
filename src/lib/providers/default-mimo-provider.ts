import type {
  MimoProvider,
  TTSRequest,
  TTSResponse,
  ASRRequest,
  ASRResponse,
} from "./mimo-provider";

const MIMO_API_KEY = process.env.MIMO_API_KEY!;
const MIMO_BASE_URL = process.env.MIMO_BASE_URL!;

export class DefaultMimoProvider implements MimoProvider {
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const body: Record<string, unknown> = {
      model: request.model,
      input: request.input,
      context: request.context,
      response_format: request.responseFormat || "wav",
    };

    if (request.voice) body.voice = request.voice;

    if (request.voiceSample) {
      const formData = new FormData();
      Object.entries(body).forEach(([k, v]) => formData.set(k, String(v)));
      formData.set(
        "voice_sample",
        new Blob([new Uint8Array(request.voiceSample)]),
        "sample.wav"
      );

      const res = await fetch(`${MIMO_BASE_URL}/v1/audio/speech`, {
        method: "POST",
        headers: { Authorization: `Bearer ${MIMO_API_KEY}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`TTS API error: ${res.status}`);
      const audio = Buffer.from(await res.arrayBuffer());
      return { audio, model: request.model };
    }

    const res = await fetch(`${MIMO_BASE_URL}/v1/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MIMO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`TTS API error: ${res.status}`);
    const audio = Buffer.from(await res.arrayBuffer());
    return { audio, model: request.model };
  }

  async speechToText(request: ASRRequest): Promise<ASRResponse> {
    const asrApiKey = process.env.MIMO_ASR_API_KEY || MIMO_API_KEY;
    const asrBaseUrl = process.env.MIMO_ASR_BASE_URL || MIMO_BASE_URL;

    const formData = new FormData();
    formData.set(
      "file",
      request.audioStream as unknown as Blob,
      request.audioFileName
    );
    formData.set("model", request.model);
    if (request.language) formData.set("language", request.language);
    if (request.prompt) formData.set("prompt", request.prompt);
    formData.set(
      "response_format",
      request.responseFormat || "verbose_json"
    );
    if (request.timestampGranularity) {
      formData.set(
        "timestamp_granularities[]",
        request.timestampGranularity
      );
    }

    const res = await fetch(`${asrBaseUrl}/v1/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${asrApiKey}` },
      body: formData,
      signal: request.signal,
    });

    if (!res.ok) throw new Error(`ASR API error: ${res.status}`);
    return res.json();
  }
}
