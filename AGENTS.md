# Agent Instructions

## Project Overview

MimoTTS Studio — Next.js 全栈 TTS/ASR 工具，后端接入自定义 Mimo Provider。纯自托管，无需认证和数据库。

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS 4
- **Icons**: Lucide React
- **Deployment**: Vercel / Docker standalone

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── tts/route.ts          # TTS 语音合成
│   │   ├── asr/route.ts          # ASR 语音转文字
│   │   ├── models/route.ts       # 模型与音色列表
│   │   └── ready/route.ts        # 健康检查
│   ├── studio/
│   │   ├── page.tsx              # Studio 主页面（状态管理）
│   │   └── components/           # 17 个 UI 组件
│   ├── layout.tsx
│   ├── page.tsx                  # → redirect /studio
│   └── globals.css               # Tailwind v4 + @theme Token
├── lib/
│   ├── voices.ts                 # 8 个预置音色数据
│   ├── text-tags.ts              # 文本标签定义
│   ├── context-presets.ts        # 声线预设
│   ├── config.ts                 # 应用配置常量
│   ├── utils.ts                  # 工具函数
│   └── providers/
│       ├── mimo-provider.ts      # Provider 接口
│       └── default-mimo-provider.ts  # 默认实现（Mimo API）
└── types/index.ts                # 全局类型定义
```

## Commands

```bash
npm run dev       # 开发服务器 (localhost:3000)
npm run build     # 生产构建
npm run start     # 启动生产服务器
npm run lint      # ESLint 检查
prettier --check "src/**/*.{ts,tsx}"  # 格式检查（全局安装）
prettier --write "src/**/*.{ts,tsx}"  # 格式化
```

## Key Rules

- Prettier 已全局安装，不需要项目内 `npm install prettier`
- ESLint 保留项目本地依赖
- 修改 `globals.css` 后如遇样式失效，执行 `rm -rf .next && npm run dev`
- 环境变量通过 `.env.local` 配置，不要提交到 git
- 所有 API 通过 `/api/tts`、`/api/asr`、`/api/models`、`/api/ready` 路由暴露

## Environment Variables

```env
MIMO_API_KEY=your-api-key       # 必填
MIMO_BASE_URL=https://...       # 必填
MIMO_ASR_API_KEY=               # 可选，不填复用 TTS
MIMO_ASR_BASE_URL=              # 可选，不填复用 TTS
```

## API Model IDs (Fixed)

| Mode | Model ID |
|---|---|
| Preset TTS | `mimo-v2.5-tts` |
| Voice Design | `mimo-v2.5-tts-voicedesign` |
| Voice Clone | `mimo-v2.5-tts-voiceclone` |
| ASR | `mimo-v2.5-asr` |

## Common Pitfalls

1. **Turbopack 缓存**: 修改 CSS 后若样式失效，清除 `.next` 目录
2. **HMR WebSocket**: 局域网访问需配置 `allowedDevOrigins`
3. **ASR Body Limit**: Vercel 限制 4.5MB，本地 Docker 可配置更大
4. **Provider 接口**: TTS/ASR 均通过 `/chat/completions` 调用，非 `/audio/speech`
