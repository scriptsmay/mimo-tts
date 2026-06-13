import type { MimoProvider, TTSRequest, TTSResponse, ASRRequest, ASRResponse } from './mimo-provider';

const MIMO_API_KEY = process.env.MIMO_API_KEY!;
const MIMO_BASE_URL = process.env.MIMO_BASE_URL!.replace(/\/+$/, '');

export class DefaultMimoProvider implements MimoProvider {
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const messages = [
      { role: 'user', content: request.context },
      { role: 'assistant', content: request.input },
    ];

    const body: Record<string, unknown> = {
      model: request.model,
      messages,
      context: request.context,
    };

    if (request.voice) body.voice = request.voice;

    if (request.voiceSample) {
      const formData = new FormData();
      Object.entries(body).forEach(([k, v]) => {
        if (k === 'messages') {
          formData.set(k, JSON.stringify(v));
        } else {
          formData.set(k, String(v));
        }
      });
      formData.set('voice_sample', new Blob([new Uint8Array(request.voiceSample)]), 'sample.wav');

      const res = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${MIMO_API_KEY}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`TTS API error: ${res.status}`);
      const data = await res.json();
      const audioBase64 = data.choices?.[0]?.message?.audio?.data;
      if (!audioBase64) throw new Error('No audio data in response');
      const audio = Buffer.from(audioBase64, 'base64');
      return { audio, model: request.model };
    }

    const res = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MIMO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`TTS API error: ${res.status}`);
    const data = await res.json();
    const audioBase64 = data.choices?.[0]?.message?.audio?.data;
    if (!audioBase64) throw new Error('No audio data in response');
    const audio = Buffer.from(audioBase64, 'base64');
    return { audio, model: request.model };
  }

  async speechToText(request: ASRRequest): Promise<ASRResponse> {
    const asrApiKey = process.env.MIMO_ASR_API_KEY || MIMO_API_KEY;
    const asrBaseUrl = (process.env.MIMO_ASR_BASE_URL || MIMO_BASE_URL).replace(/\/+$/, '');

    // 读取音频流到 buffer
    const chunks: Uint8Array[] = [];
    const reader = request.audioStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // 转换为 data URL
    const base64 = Buffer.from(audioBuffer).toString('base64');
    const mime = request.audioMimeType || 'audio/wav';
    const dataUrl = `data:${mime};base64,${base64}`;

    const res = await fetch(`${asrBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${asrApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'input_audio',
                input_audio: { data: dataUrl, format: 'wav' },
              },
            ],
          },
        ],
      }),
      signal: request.signal,
    });

    if (!res.ok) throw new Error(`ASR API error: ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { text, segments: [] };
  }
}
