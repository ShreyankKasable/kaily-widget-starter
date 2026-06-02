# Kaily Widget Starter — Build Plan

A public GitHub starter template that users clone and customize to build their own
Kaily chat widget on top of [`@kaily-ai/chat-sdk`](https://www.npmjs.com/package/@kaily-ai/chat-sdk)
(internal codename: **seraph**).

---

## Goals

1. **Cover every seraph method** — all SDK methods live in one documented place
   (`kaily/useKaily.ts` + `kaily/client.ts`), so "uses all methods" is true and discoverable.
2. **Dead simple to modify** — 90% of users only edit `config.ts`, `plugins.ts`, and `ui/`.
   SDK wiring and mount logic stay in `kaily/` (hands off).
3. **Mirror real-world usage** — modeled on the production reference repo
   `ashish-seraf-Ibraq` (plugins/tools, setUser/setContext, message streaming, thread history),
   plus opt-in voice/video/attachments.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Coverage style | Layered: one `useKaily` hook covers all methods; default UI uses common ones; advanced features are opt-in modules. |
| Target user edits | UI/branding **and** plugins, enable/disable features, voice/video call, attachments. |
| Framework & build | **React + Vite (JavaScript / JSX)** — no TypeScript; config shape documented via JSDoc `@typedef` for editor autocomplete. Matches the JS reference repo. |
| Mount mode | Both **floating** + **inline**, mount logic kept in `kaily/` away from users. |
| Feature defaults | **Common ON** (threads, attachments, suggestions, feedback), **advanced OFF** (voice, video). |
| Deploy | Keep the **CDN deploy** script (`npm run deploy`). |
| Dependency | `@kaily-ai/chat-sdk@^2.1.3` from **npm** (never the local `file:` path). |

---

## Target structure

```
kaily-widget-starter/
├─ .env.example              # VITE_KAILY_TOKEN, VITE_KAILY_BASE_URL (no live secrets)
├─ index.html                # Vite entry
├─ vite.config.js
├─ jsconfig.json             # editor JSX hints + path aliases (optional, no TS)
├─ src/
│  │  ★ = files users edit
│  ├─ config.js          ★  token, env, branding, mount mode, FEATURE TOGGLES
│  ├─ plugins.js         ★  client tools (addTool) — users add their own here
│  ├─ index.jsx             bootstrap + self-mount (don't touch)
│  │
│  ├─ kaily/                ── SDK layer (keep away from users) ──
│  │  ├─ client.js          platform bootstrap: getInstance/createInstance/
│  │  │                     getInstanceById/createBotInstance/switchBot/getBot/
│  │  │                     destroy/login/logout/getLoggedInUser/getApps
│  │  ├─ useKaily.js        ONE hook wrapping EVERY bot method (documented w/ JSDoc)
│  │  ├─ mount.jsx          floating ⟷ inline mount logic (hidden from user)
│  │  └─ types.js           JSDoc @typedef definitions for config + SDK shapes
│  │
│  ├─ features/             ── opt-in, each gated by config.features ──
│  │  ├─ threads.js         getThreads/getMessages/updateThread/deleteThread/deleteAllThreads
│  │  ├─ attachments.js     getUploadUrl/upload/setDocuments
│  │  ├─ voice.js           initiateWebCall/disconnectWebCall
│  │  ├─ video.js           initiateWebVideoCall/videoCallMessage/getAIActions
│  │  ├─ suggestions.js     getSuggestions
│  │  └─ feedback.js        feedback/captureData
│  │
│  └─ ui/                   ★ users restyle/rebrand here
│     ├─ Widget.jsx         composition root (reads config.features, renders parts)
│     ├─ Launcher.jsx       floating bubble
│     ├─ MessageList.jsx · Composer.jsx · HistoryPanel.jsx · VoiceButton.jsx …
│     └─ styles.css         all classes prefixed .kw-
```

### `config.js` — the one file most users edit

```js
/** @type {import("./kaily/types").WidgetConfig} */
export const config = {
  token: import.meta.env.VITE_KAILY_TOKEN,
  serviceBaseUrl: import.meta.env.VITE_KAILY_BASE_URL,
  environment: "production",
  surfaceClient: "web",
  theme: { title: "Assistant", primaryColor: "#7a5af5", launcherIcon: "💬", position: "bottom-right" },
  mount: { mode: "floating", target: "#kaily-root" },   // "floating" | "inline"
  features: {
    threads: true,      // history panel
    attachments: true,  // file upload
    suggestions: true,
    feedback: true,
    voiceCall: false,
    videoCall: false,
  },
};
```

---

## Execution model

- **One method (or tight group) per step. Commit each. Then move to the next.**
- **Each step stays runnable** — after Step 6 there's a working chat; later steps add without breaking it.
- **`useKaily` grows incrementally** — only that step's method(s) are added each commit.
- Work on a branch (e.g. `feat/widget-template`) off `main`.

---

## Roadmap (each row = one commit)

### Phase 0 · Foundation (no SDK methods yet)

| Step | What | Commit |
| --- | --- | --- |
| 1 | React + Vite (JS) setup: `package.json` (`@kaily-ai/chat-sdk@^2.1.3` from npm), `vite.config.js`, `index.html`, `jsconfig.json`, `.env.example`, `.gitignore` | `chore: scaffold React + Vite project` |
| 2 | `src/config.js` (+ `src/kaily/types.js` JSDoc typedefs) — token, env, branding/theme, mount mode, feature toggles | `feat: add central config with feature flags` |
| 3 | `src/kaily/client.js` — platform bootstrap: `getInstance` → `createBotInstance` | `feat: kaily platform client (getInstance/createBotInstance)` |
| 4 | `src/kaily/mount.jsx` + `src/index.jsx` — floating ⟷ inline mount, self-mount | `feat: floating + inline mount logic` |

### Phase 1 · Core chat

| Step | Method(s) | Commit |
| --- | --- | --- |
| 5 | `useKaily` hook skeleton — connect bot, expose it | `feat: useKaily hook (bot connection)` |
| 6 | **`message()`** + `deltaListener`/`replyListener` streaming + UI (Launcher, MessageList, Composer, Widget) | `feat: streaming chat via bot.message` |
| 7 | **`stopMessage()`** — stop button | `feat: stop generation` |
| 8 | **`setUser()` / `unsetUser()`** — identity | `feat: user identity` |
| 9 | **`setContext()` / `captureData()`** — context to the LLM | `feat: context + data capture` |

### Phase 2 · Plugins (key extensibility point)

| Step | Method(s) | Commit |
| --- | --- | --- |
| 10 | **`addTool` / `removeTool` / `removeAllTools` / `getFrontendActions`** + `src/plugins.ts` + tool listeners (`toolMessageListener`, `toolComponentMessageListener`, `progressListener`) | `feat: client tools / plugins` |

### Phase 3 · Threads (history)

| Step | Method(s) | Commit |
| --- | --- | --- |
| 11 | **`getThreads()` / `getMessages()`** → HistoryPanel | `feat: thread history panel` |
| 12 | **`updateThread()` / `deleteThread()` / `deleteAllThreads()`** + new thread | `feat: manage threads` |
| 13 | **`updateMessage()`** | `feat: edit message` |

### Phase 4 · Attachments

| Step | Method(s) | Commit |
| --- | --- | --- |
| 14 | **`getUploadUrl()` / `upload()`** → attachment UI | `feat: file attachments` |
| 15 | **`setDocuments()` / `uploadHtmlComponent()`** | `feat: documents + html components` |

### Phase 5 · Suggestions & feedback

| Step | Method(s) | Commit |
| --- | --- | --- |
| 16 | **`getSuggestions()`** | `feat: suggestions` |
| 17 | **`feedback()`** | `feat: message feedback` |

### Phase 6 · Voice & Video (advanced, OFF by default)

| Step | Method(s) | Commit |
| --- | --- | --- |
| 18 | **`initiateWebCall()` / `disconnectWebCall()`** (voice) | `feat: voice call` |
| 19 | **`initiateWebVideoCall()` / `videoCallMessage()` / `getAIActions()`** (video) | `feat: video call` |

### Phase 7 · Platform extras & ship

| Step | Method(s) | Commit |
| --- | --- | --- |
| 20 | **`switchBot` / `getBot` / `login` / `logout` / `getLoggedInUser` / `getApps` / `getCopilotAppDetails` / `destroy`** | `feat: platform lifecycle methods` |
| 21 | Port `deploy.js` — `npm run deploy` builds self-mounting bundle + uploads to CDN | `feat: CDN deploy script` |
| 22 | README + `.env.example` polish, final docs | `docs: usage guide` |

---

## Seraph method coverage map

Every public SDK method and where it lands in the template:

| Area | Methods | Location |
| --- | --- | --- |
| Platform / lifecycle | `getInstance`, `createInstance`, `getInstanceById`, `createBotInstance`, `getBot`, `switchBot`, `destroy` | `kaily/client.js` |
| Auth / user | `login`, `logout`, `getLoggedInUser`, `setUser`, `unsetUser`, `getApps`, `getCopilotAppDetails` | `kaily/client.js`, `useKaily.js` |
| Messaging | `message`, `subscribeToMessage`, `stopMessage`, `updateMessage` | `useKaily.js` |
| Threads | `getThreads`, `getMessages`, `updateThread`, `deleteThread`, `deleteAllThreads` | `features/threads.js` |
| Context / data | `setContext`, `captureData`, `feedback`, `setDocuments`, `uploadHtmlComponent` | `useKaily.js`, `features/feedback.js` |
| Client tools | `addTool`, `removeTool`, `removeAllTools`, `getFrontendActions` | `plugins.js`, `useKaily.js` |
| Files | `getUploadUrl`, `upload` | `features/attachments.js` |
| Suggestions | `getSuggestions` | `features/suggestions.js` |
| Voice / video | `videoCallMessage`, `initiateWebCall`, `initiateWebVideoCall`, `getAIActions`, `disconnectWebCall` | `features/voice.js`, `features/video.js` |

### Message listeners (from the reference repo)

`bot.message({ text, path, thread_id }, listeners)` supports:
`deltaListener`, `replyListener`, `toolComponentMessageListener`, `progressListener`, `toolMessageListener`.
