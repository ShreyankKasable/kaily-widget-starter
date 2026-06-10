// ─────────────────────────────────────────────────────────────────────────────
// Plugins (client tools) — functions the assistant can call IN THE BROWSER.
// This is one of the main files you edit. Add your own tools here.
//
// When the assistant decides a tool is needed, its `handler` runs in the page
// and whatever it returns is sent back to the assistant to use in its reply.
//
// Each tool:
//   name         unique tool name (string)
//   description  what it does — the assistant uses this to decide when to call it
//   parameters   JSON Schema for the arguments (type must be "object")
//   timeout      max ms the handler may run (REQUIRED, > 0)
//   handler      async function: receives the args, returns a result
// ─────────────────────────────────────────────────────────────────────────────

export const plugins = [
  {
    name: "get_current_time",
    description:
      "Get the user's current local date and time. Use this when the user asks what time or date it is.",
    parameters: { type: "object", properties: {} },
    timeout: 8000,
    handler: async () => ({ now: new Date().toLocaleString() }),
  },

  // ── Example: a tool that takes arguments and acts on the page ──
  // (uncomment to try — then ask the assistant to "open google.com")
  // {
  //   name: "open_url",
  //   description: "Open a URL in a new browser tab for the user.",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       url: { type: "string", description: "The full URL to open, e.g. https://google.com" },
  //     },
  //     required: ["url"],
  //   },
  //   timeout: 8000,
  //   handler: async ({ url }) => {
  //     window.open(url, "_blank", "noopener");
  //     return { success: true, opened: url };
  //   },
  // },
];
