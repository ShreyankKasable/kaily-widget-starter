// ─────────────────────────────────────────────────────────────────────────────
// Kaily platform client — bootstraps the SDK and connects the bot.
// This is part of the SDK layer; you normally don't need to touch it.
// All connection settings come from `config.js` (which reads `.env`).
// ─────────────────────────────────────────────────────────────────────────────

import { CopilotPlatform } from "@kaily-ai/chat-sdk";
import { config } from "../config";

/** @type {import("@kaily-ai/chat-sdk").CopilotPlatform | null} */
let platform = null;

/**
 * Get (or lazily create) the singleton CopilotPlatform instance.
 * Wraps `CopilotPlatform.getInstance`.
 */
export function getPlatform() {
  if (!platform) {
    if (!config.serviceBaseUrl) {
      throw new Error(
        "[kaily-widget] Missing serviceBaseUrl — set VITE_KAILY_BASE_URL in your .env",
      );
    }
    const options = {
      serviceBaseUrl: config.serviceBaseUrl,
      surfaceClient: config.surfaceClient,
    };
    // Only pass `environment` when explicitly set — it overrides serviceBaseUrl.
    if (config.environment) options.environment = config.environment;
    platform = CopilotPlatform.getInstance(options);
  }
  return platform;
}

/**
 * Connect to the bot. Wraps `platform.createBotInstance(token)`, which
 * authenticates and opens the connection, returning a ready bot instance.
 *
 * @returns {Promise<{ platform: import("@kaily-ai/chat-sdk").CopilotPlatform, bot: import("@kaily-ai/chat-sdk").CopilotBot }>}
 */
export async function connect() {
  if (!config.token) {
    throw new Error(
      "[kaily-widget] Missing token — set VITE_KAILY_TOKEN in your .env",
    );
  }
  const p = getPlatform();
  const bot = await p.createBotInstance(config.token);
  return { platform: p, bot };
}
