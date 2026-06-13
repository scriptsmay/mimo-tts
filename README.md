# MimoTTS Studio

基于 Next.js 全栈的 TTS/ASR 工具，复刻 MimoTTS Studio 的参数定义与语音生成功能，后端接入自定义 Mimo Provider。

**纯自托管** — 无需认证、无需数据库、部署即用。

## 功能

| 模块 | 模型 | 说明 |
|---|---|---|
| 文字转语音 | `mimo-v2.5-tts` | 8 个预置音色（4 中文 + 4 英文），支持试听 |
| 音色设计 | `mimo-v2.5-tts-voicedesign` | 通过自然语言描述期望音色 |
| 声音克隆 | `mimo-v2.5-tts-voiceclone` | 上传参考音频样本克隆声线 |
| 语音转文字 | `mimo-v2.5-asr` | 多语言识别，支持时间轴标注 |

### 核心特性

- **自然语言控制** — 用一段话描述语音风格（语速、情绪、方言等），无需复杂参数
- **文本标签** — 在文本中插入 `(轻声)`、`[停顿]`、`[强调]` 等标签精细控制
- **声线预设** — 一键填充预设的自然语言控制描述
- **音色试听** — 每个预置音色均可一键试听样本
- **历史记录** — 浏览器 localStorage 本地存储，最多 50 条
- **音频播放** — 内置播放器，支持播放/暂停、进度条、下载

## 快速开始

### 环境要求

- Node.js >= 18
- Mimo API Key（[获取地址](https://platform.xiaomimimo.com/)）

### 本地开发

```bash
# 克隆仓库
git clone git@github.com:scriptsmay/mimo-tts.git
cd mimo-tts

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Key

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
# 使用 docker-compose
docker-compose up -d

# 或手动构建
docker build -t mimo-tts .
docker run -p 3000:3000 \
  -e MIMO_API_KEY=your-key \
  -e MIMO_BASE_URL=https://your-api.example.com \
  mimo-tts
```

### Vercel 部署

1. Push 代码到 GitHub
2. 在 [Vercel](https://vercel.com/new) 导入仓库
3. 添加环境变量 `MIMO_API_KEY` 和 `MIMO_BASE_URL`
4. 部署完成

> **注意**: Vercel Serverless 的请求体限制为 4.5MB，大文件 ASR 可能受限。

## 环境变量

```env
# Mimo TTS Provider（必填）
MIMO_API_KEY=your-api-key-here
MIMO_BASE_URL=https://your-mimo-api.example.com

# Mimo ASR Provider（可选，不填则复用 TTS 配置）
MIMO_ASR_API_KEY=
MIMO_ASR_BASE_URL=
```

## 项目结构

```
mimo-tts/
├── src/
│   ├── app/
│   │   ├── api/                    # Route Handlers
│   │   │   ├── tts/route.ts        # POST /api/tts
│   │   │   ├── asr/route.ts        # POST /api/asr
│   │   │   ├── models/route.ts     # GET /api/models
│   │   │   └── ready/route.ts      # GET /api/ready
│   │   └── studio/
│   │       ├── page.tsx            # 主页面（状态管理）
│   │       └── components/         # UI 组件
│   ├── lib/
│   │   ├── voices.ts               # 预置音色数据
│   │   ├── text-tags.ts            # 文本标签
│   │   ├── context-presets.ts      # 声线预设
│   │   ├── config.ts               # 配置常量
│   │   └── providers/              # Mimo Provider 层
│   └── types/index.ts
├── docs/
│   └── PROJECT_DEV_DOC.md          # 开发文档
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## API 接口

### `GET /api/models`

返回预置音色列表和可用模型。

### `POST /api/tts`

语音合成。FormData 字段：`mode`、`text`、`context`、`voice`（preset 模式必填）。

### `POST /api/asr`

语音转文字。FormData 字段：`audioFile`、`language`、`responseFormat`、`timestampGranularity`。

### `GET /api/ready`

健康检查，返回 Provider 连通状态。

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| 图标 | Lucide React |
| 语言 | TypeScript |
| 部署 | Vercel / Docker |

## License

Private
