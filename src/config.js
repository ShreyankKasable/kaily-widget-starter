// ─────────────────────────────────────────────────────────────────────────────
// Widget configuration — THIS is the main file you edit.
// Set your token + API URL in `.env` (see `.env.example`), then tweak the theme,
// mount mode, and feature toggles below.
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import("./kaily/types").WidgetConfig} */
export const config = {
  // ── Connection (read from .env) ──
  token: import.meta.env.VITE_KAILY_TOKEN,
  serviceBaseUrl: import.meta.env.VITE_KAILY_BASE_URL,
  environment: "production",
  surfaceClient: "web",

  // ── Branding ──
  theme: {
    title: "Assistant",
    primaryColor: "#7a5af5",
    launcherIcon: "💬",
    position: "bottom-right",
  },

  // ── Where the widget mounts ──
  //   "floating" → a floating launcher bubble in the corner (default)
  //   "inline"   → render into the element matching `target`
  mount: {
    mode: "floating",
    target: "#kaily-root",
  },

  // ── Feature toggles ──
  // Flip these on/off. The UI and SDK wiring follow automatically.
  features: {
    threads: true, // conversation history panel
    attachments: true, // file uploads
    suggestions: true, // suggested replies
    feedback: true, // thumbs up/down on bot replies
    voiceCall: false, // voice calls (advanced)
    videoCall: false, // video calls (advanced)
  },
};
