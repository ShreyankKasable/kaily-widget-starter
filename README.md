# Kaily Widget Starter

A starter template for building your own custom [Kaily](https://kaily.ai) chat
widget on top of [`@kaily-ai/chat-sdk`](https://www.npmjs.com/package/@kaily-ai/chat-sdk).
Clone it, set your token, customize the UI, and deploy.

> 🚧 **Work in progress.** This template is being built step by step.
> See [`PLAN.md`](./PLAN.md) for the full roadmap and structure.

## Quick start

```bash
npm install
cp .env.example .env   # then add your bot token + API base URL
npm run dev            # http://localhost:9101
```

## Stack

- **React + Vite** (JavaScript / JSX) — no TypeScript build step
- **`@kaily-ai/chat-sdk`** for all chat, tools, threads, files, and voice/video
