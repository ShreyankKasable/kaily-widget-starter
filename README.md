# Kaily Widget Starter

A **skeleton** for building your own custom [Kaily](https://kaily.ai) chat widget
on top of [`@kaily-ai/chat-sdk`](https://www.npmjs.com/package/@kaily-ai/chat-sdk).

Clone it, drop in your bot token, customize the UI and behavior, and deploy a
single self-mounting `<script>` to the Kaily CDN. Every SDK capability — chat,
streaming, threads, client tools, file uploads, suggestions, feedback, and
voice/video calls — is already wired in and toggled from one config file.

```
Launcher button → chat panel → streamed Markdown replies, history, attachments,
suggestions, 👍/👎, and (optional) voice & video calls.
```

---

## Quick start

```bash
npm install
# open src/config.js and set your `token` + `serviceBaseUrl`
npm run dev          # http://localhost:9101
```

That's it — a floating chat launcher appears in the corner. Open it and chat.

> **Requires Node 20.12+** (the deploy script uses `process.loadEnvFile`-era APIs / modern Node).

---

## What you edit vs. what you leave alone

The repo is split so you mostly touch **three places**:

| You edit ✏️ | Leave alone 🔒 |
| --- | --- |
| `src/config.js` — token, theme, features | `src/kaily/` — the SDK layer |
| `src/plugins.js` — your client tools | `src/index.jsx` — bootstrap/self-mount |
| `src/ui/` — the look & components | `deploy.js`, `vite.config.js` |

### Project structure

```
src/
  config.js          ✏️ token, API url, theme, user/context, mount, feature flags
  plugins.js         ✏️ client tools the assistant can call in the browser
  index.jsx             bootstrap — self-mounts the widget (don't edit)

  kaily/                ── SDK layer (you normally don't touch this) ──
    client.js           platform bootstrap + lifecycle (getInstance, login, …)
    useKaily.js         ONE React hook wrapping EVERY SDK method
    mount.jsx           floating vs inline mounting
    types.js            JSDoc typedefs for config autocomplete

  ui/                  ✏️ the chat UI — restyle / rearrange freely
    Widget.jsx          composition root (launcher ⇄ panel, reads config.features)
    Launcher.jsx        floating button
    MessageList.jsx     transcript (Markdown bot replies + 👍/👎 + file links)
    Composer.jsx        input + send/stop + 📎 attach
    HistoryPanel.jsx    past conversations (list / rename / delete)
    VoiceButton.jsx     voice call (Retell)
    VideoCall.jsx       video call (Anam avatar)
    styles.css          all classes prefixed `.kw-`

deploy.js              builds + uploads the widget to the Kaily CDN
vite.config.js         dev/build config
index.html             local dev host page
```

---

## Configuration (`src/config.js`)

This is the main file. Every option:

### Connection (required)

```js
token: "cat-xxxxxxxx",                              // your bot token (Kaily dashboard)
serviceBaseUrl: "https://...public.copilotz0.de",   // your Kaily API base URL
surfaceClient: "web",
// environment: "production",  // optional: "production" | "uat" | "sit"
//                              // ⚠️ if set, OVERRIDES serviceBaseUrl
```

These are **plain strings** (not `.env` vars) on purpose — the same values are
used by `npm run dev` (Vite) and `npm run deploy` (esbuild), and the token is a
public client token that ships in the browser bundle anyway.

### User identity (optional)

```js
user: null,
// or, to scope conversations to a logged-in user:
// user: { name: "Jane", email: "jane@acme.com", phone, hostId: currentUser.id, additionalFields }
```

Leave `null` for anonymous. You can also set it at runtime after login via
`setUser()` / `unsetUser()` from `useKaily`.

### Context (optional)

```js
context: null,
// or: context: { currentPage: location.pathname, plan: "pro" }
```

Situational info handed to the assistant so it can tailor replies. Update at
runtime with `setContext()`.

### Branding

```js
theme: {
  title: "Assistant",
  primaryColor: "#7a5af5",
  launcherIcon: "💬",
  position: "bottom-right",   // or "bottom-left"
},
```

### Mount mode

```js
mount: {
  mode: "floating",     // "floating" = corner bubble | "inline" = into an element
  target: "#kaily-root" // CSS selector used when mode is "inline"
},
```

### Feature toggles

Flip features on/off — the UI and SDK wiring follow automatically.

```js
features: {
  threads: true,      // 🕑 conversation history panel
  attachments: true,  // 📎 file uploads
  suggestions: true,  // suggested prompt chips on an empty chat
  feedback: true,     // 👍/👎 on bot replies
  voiceCall: false,   // 📞 voice call  (advanced — see below)
  videoCall: false,   // 🎥 video call  (advanced — see below)
},
```

---

## Adding client tools / plugins (`src/plugins.js`)

Plugins are **functions the assistant can call in the browser**. When the model
decides a tool is needed, your `handler` runs in the page and the return value is
sent back into the reply.

```js
export const plugins = [
  {
    name: "get_current_time",
    description: "Get the user's current local date and time.",
    parameters: { type: "object", properties: {} },
    timeout: 8000,                       // REQUIRED, > 0
    handler: async () => ({ now: new Date().toLocaleString() }),
  },
  // Example with arguments + a page-side action:
  {
    name: "open_url",
    description: "Open a URL in a new tab.",
    parameters: {
      type: "object",
      properties: { url: { type: "string", description: "Full URL" } },
      required: ["url"],
    },
    timeout: 8000,
    handler: async ({ url }) => {
      window.open(url, "_blank", "noopener");
      return { success: true, opened: url };
    },
  },
];
```

Add as many as you like — they're registered automatically on connect.

---

## Customizing the UI

All UI lives in `src/ui/` and every class is prefixed `.kw-` (in `styles.css`) so
it won't clash with a host page. The components are small and presentational:

- Change colors/layout in `styles.css` or via `config.theme`.
- Restructure the panel in `Widget.jsx`.
- The chat logic isn't in here — it comes from the `useKaily` hook, so you can
  rebuild the UI completely without touching the SDK wiring.

### The `useKaily` hook

`src/kaily/useKaily.js` exposes **every** SDK method in one place. Your UI calls
these; you can call them from your own components too:

```
state:     bot, status, error, messages, sending
chat:      send, stop, subscribeToMessage
identity:  setUser, unsetUser, setContext, captureData
tools:     addTool, removeTool, removeAllTools, getFrontendActions
threads:   listThreads, loadThread, newThread, updateThread, deleteThread,
           deleteAllThreads, updateMessage
files:     uploadFile, setDocuments, uploadHtmlComponent
extras:    getSuggestions, sendFeedback
voice:     startVoiceCall, endVoiceCall
video:     startVideoCall, sendVideoMessage, endVideoCall, getAIActions
```

Platform/lifecycle helpers (multi-bot, auth) live in `src/kaily/client.js`:
`getBot`, `switchBot`, `login`, `logout`, `getLoggedInUser`, `getApps`,
`getCopilotAppDetails`, `destroyPlatform`, `createInstance`, `getInstanceById`.

---

## Voice & video calls (advanced)

These are **off by default** and need a bit more than a flag:

- **Voice** (`voiceCall: true`) uses **[Retell](https://www.retellai.com/)**
  (`retell-client-js-sdk`). `initiateWebCall()` returns a Retell access token;
  `RetellWebClient` handles mic capture + audio playback. Your **bot must be
  configured for Retell voice** (the call data must include an `access_token`).
- **Video** (`videoCall: true`) uses **[Anam](https://anam.ai/)**
  (`@anam-ai/js-sdk`) for the talking-avatar stream. Your **bot must be
  configured for Anam video** (the call data must include a `token`).

Both SDKs are **lazy-loaded** — they're only downloaded when a call actually
starts, so they don't bloat the default bundle. Calls require microphone (and,
for video, camera) permission.

---

## Deploying to the CDN

```bash
npm run deploy
```

This runs `deploy.js`, which calls the SDK's `deploy()` helper to **bundle
`src/index.jsx` (JS + CSS) into one self-mounting file and upload it** to the
Kaily CDN. It prints an **embed URL**:

```html
<script src="https://.../v1/widgets/cat-xxxxxxxx"></script>
```

The dashboard wires that URL up automatically, so your custom widget shows on the
agent's **Overview** page.

`deploy.js` reads `token` and `serviceBaseUrl` from `config.js`. If your **deploy
backend differs from your chat backend**, point `serviceBaseUrl` (or a dedicated
value in `deploy.js`) at the backend that serves `/v1/widgets/deploy/*`.

> Note: deploy uses **esbuild**, which (unlike Vite) does not replace
> `import.meta.env`. That's why this template keeps config values as plain
> strings in `config.js` rather than `.env`.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server at `http://localhost:9101` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run deploy` | Bundle + upload the widget to the Kaily CDN |

## Tech stack

- **React + Vite** (JavaScript / JSX — no TypeScript build step; config autocompletes via JSDoc)
- **`@kaily-ai/chat-sdk`** for all chat/threads/tools/files/voice/video
- **react-markdown** for rendering bot replies
- **retell-client-js-sdk** (voice) · **@anam-ai/js-sdk** (video) — lazy-loaded

## License

MIT
