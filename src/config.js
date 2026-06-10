// ─────────────────────────────────────────────────────────────────────────────
// Widget configuration — THIS is the main file you edit.
// Set your token + API URL below, tweak the theme, mount mode, and which
// features are on. Plain strings (no env vars) so the same values work in both
// `npm run dev` and `npm run deploy`.
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import("./kaily/types").WidgetConfig} */
export const config = {
  // ── Connection (REQUIRED) ──
  // Get these from the Kaily dashboard. Replace the placeholders before running.
  token: "cat-00hrne6v", // your bot token
  // serviceBaseUrl: "https://asia-south1.public.uat.copilotz0.de", // your Kaily API base URL
  surfaceClient: "web",
  environment: "uat",
  // Optional shortcut to a known Kaily cluster: "production" | "uat" | "sit".
  // ⚠️ If set, this OVERRIDES serviceBaseUrl above. Leave it out to use serviceBaseUrl.

  // ── User identity (optional) ──
  // Anonymous by default. To scope conversations to a logged-in user, fill this
  // from your own app/auth — e.g.:
  //   user: { name: "Jane", email: "jane@acme.com", hostId: currentUser.id },
  // Or set it at runtime after login via the setUser()/unsetUser() returned by
  // useKaily. Shape: { name, email, phone, hostId, additionalFields }.
  user: null,

  // ── Context (optional) ──
  // Extra situational info handed to the assistant so it can tailor replies.
  // Fill from your app — e.g. { currentPage: location.pathname, plan: "pro" }.
  // Or set/update it at runtime via setContext() from useKaily.
  context: null,

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
    feedback: false, // thumbs up/down on bot replies
  },
};
