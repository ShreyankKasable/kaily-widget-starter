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
  surfaceClient: "web",
  // Optional shortcut to a known Kaily cluster: "production" | "uat" | "sit".
  // ⚠️ If set, this OVERRIDES serviceBaseUrl above. Leave it out to use serviceBaseUrl.
  // environment: "production",

  // ── User identity (optional) ──
  // Anonymous by default. To scope conversations to a logged-in user, fill this
  // from your own app/auth — e.g.:
  //   user: { name: "Jane", email: "jane@acme.com", hostId: currentUser.id },
  // Or set it at runtime after login via the setUser()/unsetUser() returned by
  // useKaily. Shape: { name, email, phone, hostId, additionalFields }.
  user: null,

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
