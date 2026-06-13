## MimoTTS 全栈复刻项目 — 开发文档

### 1. 项目概述

本项目的目标是将 MimoTTS Studio 的参数定义与语音生成功能完全复刻，后端接入自定义的 Mimo Provider。技术栈采用 Next.js 全栈方案（App Router），前端使用 React + Tailwind CSS，后端使用 Next.js Route Handlers 作为 API 层。

本项目为**纯自托管工具**，不需要认证登录、额度管理和管理后台。部署后即可直接使用，API Key 在服务端环境变量中统一配置。

---

### 2. 功能模块全景

MimoTTS Studio 共包含四个功能模块：

| 模块 | 模型 ID | 说明 |
|---|---|---|
| 文字转语音（Preset TTS） | `mimo-v2.5-tts` | 从预置音色中选择，结合自然语言控制生成语音 |
| 音色设计（Voice Design） | `mimo-v2.5-tts-voicedesign` | 通过自然语言描述理想音色，无需选择预置音色 |
| 声音克隆（Voice Clone） | `mimo-v2.5-tts-voiceclone` | 上传参考音频样本，克隆其声线特征生成语音 |
| 语音转文字（ASR） | `mimo-v2.5-asr` | 上传音频文件，识别为文本，支持多语言和时间轴标注 |

---

### 3. 预置音色定义

系统内置 8 个预置音色（4 中文 + 4 英文）：

```typescript
// src/lib/voices.ts

export type Gender = "female" | "male";

export interface Voice {
  id: string;
  name: string;
  language: "zh" | "en";
  gender: Gender;
  style: string;             // 风格标签
  previewText: string;       // 试听合成文本
  previewContext: string;    // 试听时的自然语言控制描述
}

export const PRESET_VOICES: Voice[] = [
  {
    id: "冰糖",
    name: "冰糖",
    language: "zh",
    gender: "female",
    style: "活泼少女",
    previewText: "你好，我是冰糖。今天的声音会轻快一点，像把好消息递到你面前。",
    previewContext: "轻快、明亮、带一点少女感，语速中等。",
  },
  {
    id: "茉莉",
    name: "茉莉",
    language: "zh",
    gender: "female",
    style: "知性女声",
    previewText: "你好，我是茉莉。接下来我会用稳定清晰的语气，为你朗读这段内容。",
    previewContext: "知性、清楚、温和，适合说明和旁白。",
  },
  {
    id: "苏打",
    name: "苏打",
    language: "zh",
    gender: "male",
    style: "阳光少年",
    previewText: "你好，我是苏打。让我们把这句话读得更自然，也更有朝气。",
    previewContext: "阳光、轻松、少年感，语气自然。",
  },
  {
    id: "白桦",
    name: "白桦",
    language: "zh",
    gender: "male",
    style: "成熟男声",
    previewText: "你好，我是白桦。我会用沉稳的节奏，把信息讲得可靠而清楚。",
    previewContext: "成熟、稳重、有可信度，语速略慢。",
  },
  {
    id: "Mia",
    name: "Mia",
    language: "en",
    gender: "female",
    style: "Lively girl",
    previewText: "Hi, I'm Mia. I can make this sentence sound bright, friendly, and full of energy.",
    previewContext: "Bright, lively, and friendly. Medium pace.",
  },
  {
    id: "Chloe",
    name: "Chloe",
    language: "en",
    gender: "female",
    style: "Sweet Dreamy",
    previewText: "Hi, I'm Chloe. This preview is soft, calm, and a little dreamy.",
    previewContext: "Soft, sweet, dreamy, and gentle.",
  },
  {
    id: "Milo",
    name: "Milo",
    language: "en",
    gender: "male",
    style: "Sunny boy",
    previewText: "Hi, I'm Milo. I can read this line with a clear and sunny tone.",
    previewContext: "Sunny, youthful, clear, and relaxed.",
  },
  {
    id: "Dean",
    name: "Dean",
    language: "en",
    gender: "male",
    style: "Steady Gentle",
    previewText: "Hi, I'm Dean. I will keep the delivery steady, gentle, and easy to follow.",
    previewContext: "Steady, gentle, mature, and calm.",
  },
];
```

---

### 4. 文本标签系统

文本标签（Text Tags）允许用户在合成文本中插入控制标记，影响语音的情感、语速或方言表现：

```typescript
// src/lib/text-tags.ts

export interface TextTag {
  label: string;       // UI 显示名
  value: string;       // 插入到文本中的标记
  target: "text";      // 插入位置（合成文本框）
  presetOnly?: boolean; // 仅在 preset 模式下显示
}

export const TEXT_TAGS: TextTag[] = [
  { label: "轻声", value: "（轻声）",  target: "text" },
  { label: "停顿", value: "[停顿]",    target: "text" },
  { label: "强调", value: "[强调]",    target: "text" },
  { label: "叹气", value: "[叹气]",    target: "text" },
  { label: "粤语", value: "（粤语）",  target: "text" },
  { label: "唱歌", value: "(唱歌)",    target: "text", presetOnly: true },
];
```

标签被直接插入到用户输入的合成文本中，与文本一起发送给 API。例如：`（轻快）欢迎回来，[停顿]今天我们来聊聊。`

**关于标签透传的重要说明：** MimoTTS 原站的上游 TTS 引擎原生识别这些中括号/圆括号标记作为控制指令，因此前端原样拼接、后端原样透传即可。如果你的自定义 Mimo Provider 使用不同的 TTS 引擎后端，需要在 Provider 层做一次标签转换。例如，对于只支持 SSML 的引擎，需要在 `DefaultMimoProvider.textToSpeech()` 中增加预处理逻辑：

```typescript
// src/lib/providers/tag-transform.ts（可选，按需启用）

const TAG_MAP: Record<string, string> = {
  "[停顿]":    '<break time="0.8s"/>',
  "（轻声）":  '<prosody volume="soft">',
  "[强调]":    '<emphasis level="strong">',
  "[叹气]":    '<break time="0.3s"/>',
  "（粤语）":  '<lang xml:lang="yue">',
  "(唱歌)":    '<prosody pitch="+2st">',
};

export function transformTagsToSSML(text: string): string {
  // 根据目标引擎格式做转换，或直接透传
  return text; // 默认透传，使用 SSML 引擎时实现转换
}
```

如果你的 Provider 后端就是兼容 MimoTTS 原生标签协议的引擎，则不需要此转换，直接透传。

---

### 5. 自然语言控制（Context）

这是 MimoTTS 的核心特色之一。用户通过一段自然语言描述期望的语音风格，作为 `context` 参数传入 API：

**三种模式的默认示例：**

| 模式 | 默认 context |
|---|---|
| Preset（文字转语音） | 声音明亮，语速中等，像产品演示里的温和讲解。 |
| Design（音色设计） | 青年女性，声音清亮但不尖，吐字干净，语速中等偏快，情绪底色专业而亲切。 |
| Clone（声音克隆） | 语速稍慢，减少夸张表演，保持清晰播报。 |

**声线预设（Context Presets）— 快捷填充自然语言控制：**

```typescript
// src/lib/context-presets.ts

export const CONTEXT_PRESETS: Record<string, string[]> = {
  preset: [
    "播客旁白，语速稳定，停顿干净，尾音自然收束。",
    "短视频口播，前半句抓人，后半句放松，整体明亮。",
    "睡前故事，声线放轻，语速慢，呼吸感明显。",
  ],
  design: [
    "青年男性，声音颗粒感轻，吐字利落，节奏像科技播客主持人，情绪克制但不冷。",
    "中年女性，声线温厚，语速稳定，字尾带轻微笑意，像纪录片旁白。",
    "高龄男性，嗓音低沉松弛，停顿长，带一点沙哑和旧唱片质感。",
  ],
  clone: [
    "保持样本声线，减少夸张表演，语气清楚、平稳、贴近真实说话。",
    "跟随样本音色，加入轻微兴奋感，重音落在关键词上。",
    "保持样本声纹，语速放慢，句尾更柔和。",
  ],
};
```

---

### 6. 各模块参数详细定义

#### 6.1 Preset TTS（文字转语音）

**前端表单参数：**

```typescript
interface PresetTTSParams {
  mode: "preset";
  text: string;    // 合成文本，最大 2500 字符
  context: string; // 自然语言控制描述
  voice: string;   // 预置音色 ID，如 "冰糖"
}
```

**发送到后端的 FormData 字段：**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `mode` | string | 是 | 固定 `"preset"` |
| `text` | string | 是 | 合成文本 |
| `context` | string | 是 | 自然语言控制 |
| `voice` | string | 是 | 预置音色 ID |

#### 6.2 Voice Design（音色设计）

与 Preset 模式的区别：**不需要选择预置音色**，而是通过 context 参数完全描述期望的音色特征。

```typescript
interface VoiceDesignParams {
  mode: "design";
  text: string;
  context: string;  // 核心参数：自然语言描述期望音色
}
```

FormData 字段与 Preset 相同，但不发送 `voice` 字段。

#### 6.3 Voice Clone（声音克隆）

与 Preset 模式的区别：**需要上传声音样本**。

```typescript
interface VoiceCloneParams {
  mode: "clone";
  text: string;
  context: string;      // 导演模式描述
  voiceSample: File;    // 声音样本文件（mp3/wav/m4a 等）
}
```

**声音样本文件约束：**

- 支持格式：`audio/mpeg, audio/mp3, audio/wav, audio/x-wav, audio/mp4, audio/x-m4a, audio/flac, audio/ogg, audio/webm, video/mp4, video/webm`
- 文件大小上限：10 MB
- Accept 属性：`.mp3, .wav, .m4a, .mp4, .flac, .ogg, .oga, .webm, .mpga`

#### 6.4 ASR（语音转文字）

```typescript
interface ASRParams {
  audioFile: File;             // 音频/视频文件，最大 100MB
  language: string;            // 语言代码
  prompt: string;              // 提示词（可选，辅助识别）
  responseFormat: "verbose_json" | "text"; // 输出格式
  timestampGranularity: "segment" | "word"; // 时间粒度
}
```

**语言选项：**

| 值 | 显示名 |
|---|---|
| `auto` | 自动 |
| `zh` | 中文 |
| `en` | English |
| `ja` | 日本語 |
| `ko` | 한국어 |
| `fr` | Français |
| `de` | Deutsch |
| `es` | Español |

**ASR 采用同步长连接模式：**

本项目采用同步请求而非异步 Job 轮询。原因：自托管场景下无数据库/Redis，Next.js Route Handler 是无状态的，不适合维护 jobId 状态。上游 Mimo Provider（兼容 OpenAI `/v1/audio/transcriptions` 接口）本身就是同步返回的——客户端保持连接直到识别完成。因此前端直接 await 一次 `POST /api/asr` 请求即可，无需轮询。

对于较长的音频（如 30 分钟以上），前端通过 `AbortController` 提供取消能力，后端通过 `AbortSignal` 透传给上游 fetch 请求。

**接口简化为单一端点：**

```
POST /api/asr
Content-Type: multipart/form-data
```

**Request FormData：**（见第 6.4 节参数表）

**Response（成功）：**

```json
{
  "text": "识别出的完整文本",
  "segments": [
    { "start": 0.0, "end": 2.5, "text": "段落文本" }
  ]
}
```

---

### 7. 应用配置

自托管场景下，所有配置通过环境变量注入，无需运行时管理后台：

```typescript
// src/lib/config.ts

export const APP_CONFIG = {
  // 合成文本上限
  maxTextLength: 2500,
  // 声音克隆样本上限
  maxVoiceSampleMb: 10,
  // ASR 文件上限
  maxAsrFileMb: 100,
  // 历史记录条数上限（持久化于浏览器 localStorage，服务端不存储）
  maxHistoryItems: 50,
  // 输出音频格式
  defaultAudioFormat: "wav",
} as const;
```

历史记录仅存于前端浏览器 localStorage 中，key 为 `mimo-tts-history`，服务端不维护任何状态。切换浏览器或清除缓存后历史会丢失，这在自托管工具场景下是可接受的。

---

### 8. API 接口设计

所有 API 均通过 Next.js Route Handlers 实现，作为后端代理层对接自定义 Mimo Provider。自托管模式下无认证，所有接口直接可用。

#### 8.1 模型与配置

```
GET /api/models
```

返回预置音色列表和可用模型。响应结构：

```json
{
  "voices": [ /* PRESET_VOICES 数据 */ ],
  "models": [
    { "id": "mimo-v2.5-tts", "mode": "preset", "name": "预置音色 TTS" },
    { "id": "mimo-v2.5-tts-voicedesign", "mode": "design", "name": "音色设计" },
    { "id": "mimo-v2.5-tts-voiceclone", "mode": "clone", "name": "声音克隆" },
    { "id": "mimo-v2.5-asr", "mode": "asr", "name": "语音转文字" }
  ]
}
```

```
GET /api/ready
```

健康检查，返回服务是否就绪及 Provider 连通状态。

#### 8.2 TTS 语音合成

```
POST /api/tts
Content-Type: multipart/form-data
```

**Request FormData：**（见第 6 节各模式参数表）

**Response（成功）：**

```json
{
  "audio": "<base64-encoded WAV audio>"
}
```

音频在前端通过 `URL.createObjectURL(new Blob([base64ToUint8Array(audio)], { type: "audio/wav" }))` 转为可播放 URL。

#### 8.3 ASR 语音转文字

```
POST /api/asr
Content-Type: multipart/form-data
```

同步长连接请求。前端上传音频文件后，后端直接将请求流式转发到上游 Provider，等待识别完成后一次性返回结果。ASR 处理时间取决于音频长度，通常 1 分钟音频约需 5-15 秒。前端应设置较长的 `AbortController` 超时（建议 5 分钟以上）。

**Request FormData：**（见第 6.4 节参数表）

**Response（成功）：**

```json
{
  "text": "识别出的完整文本",
  "segments": [
    { "start": 0.0, "end": 2.5, "text": "段落文本" }
  ]
}
```

前端可通过 `AbortController` 取消请求，后端透传 abort 信号到上游 fetch。

---

### 9. 后端 Mimo Provider 对接设计

后端的核心理念是抽象出一个 Provider 层，将前端请求转换为 Mimo API 的标准调用格式。

#### 9.1 Provider 抽象

```typescript
// src/lib/providers/mimo-provider.ts

export interface TTSRequest {
  model: string;          // "mimo-v2.5-tts" | "mimo-v2.5-tts-voicedesign" | "mimo-v2.5-tts-voiceclone"
  input: string;          // 合成文本（含文本标签）
  context: string;        // 自然语言控制
  voice?: string;         // 预置音色 ID（仅 preset 模式）
  voiceSample?: Buffer;   // 声音样本（仅 clone 模式）
  responseFormat?: "wav" | "mp3" | "opus";  // 默认 wav
}

export interface TTSResponse {
  audio: Buffer;          // 音频二进制数据
  model: string;
  duration?: number;
}

export interface ASRRequest {
  model: string;          // "mimo-v2.5-asr"
  audioStream: ReadableStream;  // 音频文件流（避免全量加载到内存）
  audioFileName: string;  // 原始文件名
  audioMimeType: string;  // 文件 MIME 类型
  language?: string;      // 语言代码
  prompt?: string;        // 提示词
  responseFormat?: "verbose_json" | "text";
  timestampGranularity?: "segment" | "word";
  signal?: AbortSignal;   // 取消信号
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
```

#### 9.2 默认 Provider 实现

```typescript
// src/lib/providers/default-mimo-provider.ts

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

    // 声音样本以 multipart 方式发送（clone 模式）
    if (request.voiceSample) {
      const formData = new FormData();
      Object.entries(body).forEach(([k, v]) => formData.set(k, String(v)));
      formData.set("voice_sample", new Blob([request.voiceSample]), "sample.wav");

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

    // 使用流式转发，避免将整个音频文件加载到内存
    const formData = new FormData();
    formData.set("file", request.audioStream as any, request.audioFileName);
    formData.set("model", request.model);
    if (request.language) formData.set("language", request.language);
    if (request.prompt) formData.set("prompt", request.prompt);
    formData.set("response_format", request.responseFormat || "verbose_json");
    if (request.timestampGranularity) {
      formData.set("timestamp_granularities[]", request.timestampGranularity);
    }

    const res = await fetch(`${asrBaseUrl}/v1/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${asrApiKey}` },
      body: formData,
      signal: request.signal,  // 透传取消信号
    });

    if (!res.ok) throw new Error(`ASR API error: ${res.status}`);
    return res.json();
  }
}
```

#### 9.3 环境变量

```env
# .env.local

# Mimo TTS Provider（必填）
MIMO_API_KEY=your-api-key-here
MIMO_BASE_URL=https://your-mimo-api.example.com

# Mimo ASR Provider（可选，不填则复用 TTS 配置）
MIMO_ASR_API_KEY=
MIMO_ASR_BASE_URL=
```

仅需两个环境变量即可运行，极简配置。

---

### 10. 项目目录结构

```
mimo-tts/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # 根布局，全局样式
│   │   ├── page.tsx                      # 首页 → Studio 主页面
│   │   ├── studio/
│   │   │   ├── page.tsx                  # Studio 主页面
│   │   │   └── components/
│   │   │       ├── AppShell.tsx          # 页面骨架（sidebar + workspace）
│   │   │       ├── Sidebar.tsx           # 左侧功能导航栏
│   │   │       ├── TopBar.tsx            # 顶部信息栏（模型名 + 输出格式）
│   │   │       ├── ModeTabs.tsx          # 模式切换标签页
│   │   │       ├── TextInput.tsx         # 合成文本输入框 + 文本标签
│   │   │       ├── TextTags.tsx          # 文本标签按钮组
│   │   │       ├── VoiceSelector.tsx     # 预置音色选择器（Preset 模式）
│   │   │       ├── VoiceSampleUpload.tsx # 声音样本上传（Clone 模式）
│   │   │       ├── ContextControl.tsx    # 自然语言控制输入框 + 预设
│   │   │       ├── GenerateButton.tsx    # 生成/停止按钮
│   │   │       ├── AudioPlayer.tsx       # 音频播放器
│   │   │       ├── HistoryPanel.tsx      # 历史记录面板
│   │   │       ├── CurrentParams.tsx     # 当前参数展示面板
│   │   │       ├── StatusGrid.tsx        # 模型状态卡片
│   │   │       ├── ASRPanel.tsx          # 语音转文字面板
│   │   │       └── ProgressBar.tsx       # 文本字数进度条
│   │   ├── api/
│   │   │   ├── models/route.ts           # GET /api/models
│   │   │   ├── ready/route.ts            # GET /api/ready
│   │   │   ├── tts/route.ts              # POST /api/tts
│   │   │   └── asr/route.ts              # POST /api/asr（同步长连接）
│   │   └── globals.css                   # Tailwind 全局样式
│   ├── lib/
│   │   ├── voices.ts                     # 预置音色数据
│   │   ├── text-tags.ts                  # 文本标签定义
│   │   ├── context-presets.ts            # 声线预设数据
│   │   ├── config.ts                     # 应用配置常量
│   │   ├── providers/
│   │   │   ├── mimo-provider.ts          # Provider 接口定义
│   │   │   └── default-mimo-provider.ts  # 默认 Provider 实现
│   │   └── utils.ts                      # 通用工具函数
│   └── types/
│       └── index.ts                      # 全局类型定义
├── public/
│   └── ...                               # 静态资源
├── .env.local                            # 环境变量（仅 2 项）
├── next.config.ts                        # Next.js 配置
├── tailwind.config.ts                    # Tailwind 配置
├── tsconfig.json
├── package.json
└── README.md
```

---

### 11. 核心页面 UI 实现指南

#### 11.1 页面布局

页面采用三栏式布局：

```
┌──────────────────────────────────────────────────────┐
│ [TopBar] MimoTTS Studio · 模型面包屑 · 输出格式         │
├──────────────────────────────────────────────────────┤
│ [StatusGrid] 模型名称 | Provider 状态                   │
├────┬───────────────────────────────┬─────────────────┤
│    │ [ModeTabs] TTS | 设计 | 克隆   │                 │
│ S  │ [TextInput] 合成文本输入框       │ [CurrentParams] │
│ i  │ [TextTags] 文本标签按钮组        │ 当前参数面板      │
│ d  │ [VoiceSelector] 音色选择       │                 │
│ e  │ [ContextControl] 自然语言控制   │ [AudioPlayer]   │
│ b  │ [GenerateButton] 生成/停止     │ 音频播放 + 历史   │
│ a  │                               │                 │
│ r  │                               │                 │
└────┴───────────────────────────────┴─────────────────┘
```

与原站的区别：去掉了登录按钮、额度显示、凭证模式切换面板、中转站选择器、公告横幅。TopBar 只保留品牌标识和模型面包屑（如 `Preset Voice > MiMo V2.5 > WAV`）。StatusGrid 只展示当前模型和 Provider 连通状态。

#### 11.2 关键交互流程

**Preset TTS 流程：**

1. 用户选择「文字转语音」模式
2. 在音色选择器中选择一个预置音色
3. 输入合成文本（可插入文本标签）
4. 填写或选择预设的自然语言控制
5. 点击「生成语音」
6. 前端 POST FormData 到 `/api/tts`
7. 后端读取环境变量中的 API Key，调用 Mimo Provider 生成音频
8. 返回 base64 音频，前端播放并记录历史

**Voice Design 流程：**

与 Preset 基本一致，区别在于不选择预置音色，而是在 context 中自由描述期望的音色。

**Voice Clone 流程：**

1. 用户切换到「声音克隆」模式
2. 上传声音样本文件（mp3/wav 等）
3. 填写导演模式（context）和合成文本
4. 点击「生成语音」
5. FormData 中包含 voiceSample 文件字段
6. 后端将样本和参数一起发送到 Mimo Provider

**ASR 流程：**

1. 用户切换到「语音转文字」模式
2. 选择音频文件（最大 100MB）
3. 选择语言、输出格式、时间粒度
4. 点击「开始识别」
5. 前端 POST FormData 到 `/api/asr`，展示加载状态
6. 后端流式转发音频到上游 Provider，同步等待返回
7. 展示识别文本和时间轴数据
8. 用户可随时点击「取消」，通过 AbortController 中断请求

#### 11.3 右侧面板参数展示

右侧面板根据当前模式实时展示参数摘要：

```
当前参数
─────────────────
文字转语音
[mimo-v2.5-tts] (tag)  [冰糖] (tag)
声音明亮，语速中等，像产品演示里的温和讲解。
─────────────────
等待生成 / 生成中... / 生成完成
音频播放器 + 历史记录
```

---

### 12. 后端 Route Handler 实现要点

#### 12.1 TTS Route Handler

```typescript
// src/app/api/tts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { DefaultMimoProvider } from "@/lib/providers/default-mimo-provider";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const mode = formData.get("mode") as string;
  const text = formData.get("text") as string;
  const context = formData.get("context") as string;
  const voice = formData.get("voice") as string | null;
  const voiceSample = formData.get("voiceSample") as File | null;

  // 基础校验
  if (!text?.trim()) {
    return NextResponse.json({ error: "请输入合成文本" }, { status: 400 });
  }
  if (!context?.trim()) {
    return NextResponse.json({ error: "请填写自然语言控制" }, { status: 400 });
  }

  // 确定模型 ID
  const modelMap: Record<string, string> = {
    preset: "mimo-v2.5-tts",
    design: "mimo-v2.5-tts-voicedesign",
    clone: "mimo-v2.5-tts-voiceclone",
  };

  // 调用 Provider
  const provider = new DefaultMimoProvider();
  try {
    const result = await provider.textToSpeech({
      model: modelMap[mode],
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "合成失败" },
      { status: 502 }
    );
  }
}
```

#### 12.2 Models Route Handler

```typescript
// src/app/api/models/route.ts

import { NextResponse } from "next/server";
import { PRESET_VOICES } from "@/lib/voices";

export async function GET() {
  return NextResponse.json({
    voices: PRESET_VOICES,
    models: [
      { id: "mimo-v2.5-tts", mode: "preset", name: "预置音色 TTS" },
      { id: "mimo-v2.5-tts-voicedesign", mode: "design", name: "音色设计" },
      { id: "mimo-v2.5-tts-voiceclone", mode: "clone", name: "声音克隆" },
      { id: "mimo-v2.5-asr", mode: "asr", name: "语音转文字" },
    ],
  });
}
```

#### 12.3 ASR Route Handler（含 Body Limit 配置）

Next.js App Router 的 Route Handlers 默认请求体限制约 4MB，上传 100MB 音频会触发 `413 Payload Too Large`。必须在路由文件中导出 `config` 来放宽限制，并在 `next.config.ts` 中做全局配置。

```typescript
// src/app/api/asr/route.ts

import { NextRequest, NextResponse } from "next/server";
import { DefaultMimoProvider } from "@/lib/providers/default-mimo-provider";
import { APP_CONFIG } from "@/lib/config";

// 放宽本路由的请求体限制（Next.js 默认 ~4MB）
export const config = {
  api: { bodyParser: false },
};

// Route Segment Config — 设置最大允许体积
export const maxDuration = 300;  // 5 分钟超时（ASR 处理可能较慢）

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get("audioFile") as File | null;
  const language = (formData.get("language") as string) || "auto";
  const prompt = (formData.get("prompt") as string) || "";
  const responseFormat = (formData.get("responseFormat") as string) || "verbose_json";
  const timestampGranularity = (formData.get("timestampGranularity") as string) || "segment";

  if (!audioFile) {
    return NextResponse.json({ error: "请上传音频文件" }, { status: 400 });
  }

  const maxBytes = APP_CONFIG.maxAsrFileMb * 1024 * 1024;
  if (audioFile.size > maxBytes) {
    return NextResponse.json(
      { error: `音频文件不能超过 ${APP_CONFIG.maxAsrFileMb} MB` },
      { status: 400 }
    );
  }

  const ac = new AbortController();

  const provider = new DefaultMimoProvider();
  try {
    const result = await provider.speechToText({
      model: "mimo-v2.5-asr",
      audioStream: audioFile.stream(),   // 流式传递，不缓存到内存
      audioFileName: audioFile.name,
      audioMimeType: audioFile.type,
      language,
      prompt,
      responseFormat: responseFormat as "verbose_json" | "text",
      timestampGranularity: timestampGranularity as "segment" | "word",
      signal: ac.signal,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "已取消识别" }, { status: 499 });
    }
    return NextResponse.json(
      { error: err.message || "识别失败" },
      { status: 502 }
    );
  }
}
```

**关于 Body Limit 的全局配置：** 还需要在 `next.config.ts` 中设置：

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",       // Docker 部署必须开启
  experimental: {
    serverActions: {
      bodySizeLimit: "120mb", // 略大于 maxAsrFileMb，留出 FormData 开销
    },
  },
};

export default nextConfig;
```

注意：`output: "standalone"` 是 Docker standalone 多阶段构建的前提。如果不开启，Docker 镜像打包后 `server.js` 会因缺失 `node_modules` 依赖而无法运行。

---

### 13. 技术选型总结

| 层级 | 技术 | 说明 |
|---|---|---|
| 框架 | Next.js 15 (App Router) | 全栈框架，前后端统一 |
| UI | React 19 + Tailwind CSS 4 | 现代响应式 UI |
| 图标 | Lucide React | 与原站一致的图标库 |
| 状态管理 | React useState + useReducer | 轻量级，无需 Redux |
| 音频播放 | Web Audio API / HTML5 Audio | 原生音频播放 |
| 文件上传 | FormData + fetch | 原生文件上传 |
| 部署 | Docker / `npm start` | 支持容器化或 Node.js 直接运行 |

无需认证库、无需数据库、无需额外的状态管理——极简依赖。

---

### 14. 开发计划建议

**Phase 1 — 基础架构（1-2 天）**

- 项目初始化（Next.js + Tailwind + TypeScript）
- 定义类型系统、数据模型、应用配置
- 实现 Mimo Provider 接口和默认实现
- 搭建 API Route Handlers 骨架（`/api/tts`, `/api/models`, `/api/asr`）

**Phase 2 — TTS 核心功能（3-4 天）**

- 实现 Preset TTS 完整流程（前端 UI + 后端 API）
- 实现 Voice Design 模式
- 实现 Voice Clone 模式（含文件上传）
- 音频播放和历史记录

**Phase 3 — ASR 功能（1-2 天）**

- 实现 ASR 同步请求流程（流式转发 + AbortController 取消）
- 配置 body limit（next.config.ts + route segment config）
- ASR 前端面板（文件上传、语言选择、结果展示）

**Phase 4 — UI 打磨与部署（1-2 天）**

- 响应式布局优化
- Docker 化部署
- 测试与文档

总计预估：**6-10 天**

---

### 15. 快速启动命令

```bash
# 初始化项目
npx create-next-app@latest mimo-tts --typescript --tailwind --app --src-dir

# 安装依赖（极简）
cd mimo-tts
npm install lucide-react

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

---

### 16. Docker 部署

**前置条件：** 必须在 `next.config.ts` 中配置 `output: "standalone"`（见第 12.3 节），否则 `.next/standalone` 目录不会生成，Docker 镜像中的 `server.js` 将因缺失依赖无法运行。

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  mimo-tts:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MIMO_API_KEY=${MIMO_API_KEY}
      - MIMO_BASE_URL=${MIMO_BASE_URL}
    restart: unless-stopped
```

---

### 17. 与原站的关键差异点

本复刻项目为纯自托管工具，与原站的主要差异：

- **无认证**：去掉了 Linux.do OAuth 登录，部署后直接可用
- **无额度管理**：不限制使用次数，无免费额度/积分概念
- **无管理后台**：配置全部通过环境变量，无需 `/api/admin/*` 接口
- **无凭证切换**：前端不再有"平台额度 / 自定义 Key"切换，API Key 统一在后端环境变量管理
- **Provider 简化**：原站支持多上游中转站选择，本项目固定使用环境变量中配置的单一 Provider
- **前端精简**：TopBar 无登录按钮和额度显示，无公告横幅，无中转站选择器

前端 UI 的核心交互（文本输入、音色选择、文本标签、自然语言控制、音频播放、历史记录）与原站完全一致。
