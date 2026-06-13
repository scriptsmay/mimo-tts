import { NextRequest, NextResponse } from "next/server";
import { DefaultMimoProvider } from "@/lib/providers/default-mimo-provider";

const MODEL_MAP: Record<string, string> = {
  preset: "mimo-v2.5-tts",
  design: "mimo-v2.5-tts-voicedesign",
  clone: "mimo-v2.5-tts-voiceclone",
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const mode = formData.get("mode") as string;
  const text = formData.get("text") as string;
  const context = formData.get("context") as string;
  const voice = formData.get("voice") as string | null;
  const voiceSample = formData.get("voiceSample") as File | null;

  if (!text?.trim()) {
    return NextResponse.json({ error: "请输入合成文本" }, { status: 400 });
  }
  if (!context?.trim()) {
    return NextResponse.json(
      { error: "请填写自然语言控制" },
      { status: 400 }
    );
  }

  const model = MODEL_MAP[mode];
  if (!model) {
    return NextResponse.json({ error: "无效的模式" }, { status: 400 });
  }

  const provider = new DefaultMimoProvider();
  try {
    const result = await provider.textToSpeech({
      model,
      input: text,
      context,
      voice: voice || undefined,
      voiceSample: voiceSample
        ? Buffer.from(await voiceSample.arrayBuffer())
        : undefined,
    });

    return NextResponse.json({
      audio: result.audio.toString("base64"),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "合成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
