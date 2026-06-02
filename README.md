# Kaily Widget Starter

A **minimal** starter for building your own Kaily chat widget with
[`@kaily-ai/chat-sdk`](../Boltic/services/seraph). It's a single self-mounting
bundle: a floating launcher that opens a chat panel, sends a message, and streams
the agent's reply. That's it — extend it however you like.

Once deployed, the same widget renders on your agent's **Overview** page in the
Kaily dashboard.

## Quick start

```bash
npm install
npm run dev      # http://localhost:9101 — live preview
```

Set your bot token and API base URL in **`src/index.tsx`**:

```ts
const config: WidgetConfig = {
  token: "cat-xxxxxxxx",                 // from the Kaily dashboard
  serviceBaseUrl: "https://...",          // Kaily API base URL
  title: "Assistant",
  primaryColor: "#7a5af5",
};
```

## Deploy

Set the same token / API URL in **`deploy.js`**, then:

```bash
npm run deploy   # builds dist/widget.js and uploads it to the Kaily CDN
```

The command prints an **embed URL**. The dashboard wires that URL up
automatically, so your custom widget shows on the agent's Overview page.

## Project layout

```
src/
  index.tsx     # config + self-mount (edit your token here)
  Widget.tsx    # the chat UI + SDK connection (edit the UI here)
  widget.css    # styles (all classes prefixed .kw-)
deploy.js       # uploads dist/widget.js to the CDN
```

## What to build next

The widget only uses `getInstance → createBotInstance → bot.message`. The SDK
also supports threads, file uploads, suggestions, client tools, and voice/video
— add them in `Widget.tsx` as you need them.
