import { NextRequest, NextResponse } from 'next/server';
import { DefaultMimoProvider } from '@/lib/providers/default-mimo-provider';
import { APP_CONFIG } from '@/lib/config';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get('audioFile') as File | null;
  const language = (formData.get('language') as string) || 'auto';
  const prompt = (formData.get('prompt') as string) || '';
  const responseFormat = (formData.get('responseFormat') as string) || 'verbose_json';
  const timestampGranularity = (formData.get('timestampGranularity') as string) || 'segment';

  if (!audioFile) {
    return NextResponse.json({ error: '请上传音频文件' }, { status: 400 });
  }

  const maxBytes = APP_CONFIG.maxAsrFileMb * 1024 * 1024;
  if (audioFile.size > maxBytes) {
    return NextResponse.json({ error: `音频文件不能超过 ${APP_CONFIG.maxAsrFileMb} MB` }, { status: 400 });
  }

  const ac = new AbortController();

  const provider = new DefaultMimoProvider();
  try {
    const result = await provider.speechToText({
      model: 'mimo-v2.5-asr',
      audioStream: audioFile.stream(),
      audioFileName: audioFile.name,
      audioMimeType: audioFile.type,
      language,
      prompt,
      responseFormat: responseFormat as 'verbose_json' | 'text',
      timestampGranularity: timestampGranularity as 'segment' | 'word',
      signal: ac.signal,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: '已取消识别' }, { status: 499 });
    }
    const message = err instanceof Error ? err.message : '识别失败';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
