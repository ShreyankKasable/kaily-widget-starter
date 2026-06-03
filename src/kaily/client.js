// ─────────────────────────────────────────────────────────────────────────────
// Kaily platform client — bootstraps the SDK and connects the bot.
// This is part of the SDK layer; you normally don't need to touch it.
// All connection settings come from `config.js` (which reads `.env`).
// ─────────────────────────────────────────────────────────────────────────────

import { CopilotPlatform } from "@kaily-ai/chat-sdk";
import { config } from "../config";

/** @type {import("@kaily-ai/chat-sdk").CopilotPlatform | null} */
let platform = null;

// Build SDKOptions from config (shared by getInstance/createInstance).
function buildOptions(extra = {}) {
  if (!config.serviceBaseUrl) {
    throw new Error(
      "[kaily-widget] Missing serviceBaseUrl — set VITE_KAILY_BASE_URL in your .env",
    );
  }
  const options = {
    serviceBaseUrl: config.serviceBaseUrl,
    surfaceClient: config.surfaceClient,
    ...extra,
  };
  // Only pass `environment` when explicitly set — it overrides serviceBaseUrl.
  if (config.environment) options.environment = config.environment;
  return options;
}

/**
 * Get (or lazily create) the singleton CopilotPlatform instance.
 * Wraps `CopilotPlatform.getInstance`.
 */
export function getPlatform() {
  if (!platform) platform = CopilotPlatform.getInstance(buildOptions());
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

// ─────────────────────────────────────────────────────────────────────────────
// Platform lifecycle (advanced) — thin wrappers over the singleton platform.
// Most widgets won't need these; they're here for multi-bot and auth flows.
// ─────────────────────────────────────────────────────────────────────────────

/** The current connected bot. */
export const getBot = () => getPlatform().getBot();

/** Swap to a different bot by token (keeps the same platform). */
export const switchBot = (token) => getPlatform().switchBot(token);

/** Currently logged-in user, if any. */
export const getLoggedInUser = () => getPlatform().getLoggedInUser();

/** Start a login flow; `onLogin` fires with the auth context. */
export const login = (token, onLogin) => getPlatform().login(token, onLogin);

/** Log the user out. */
export const logout = () => getPlatform().logout();

/** List the apps available to this account. */
export const getApps = () => getPlatform().getApps();

/** Details for a single app: { id, token }. */
export const getCopilotAppDetails = (app) =>
  getPlatform().getCopilotAppDetails(app);

/** Tear down the platform (sockets, listeners). */
export const destroyPlatform = () => {
  getPlatform().destroy();
  platform = null;
};

// ── Multi-instance (advanced) — run several isolated platforms at once. ──
export const createInstance = (instanceId, extra = {}) =>
  CopilotPlatform.createInstance(instanceId, buildOptions(extra));

export const getInstanceById = (instanceId) =>
  CopilotPlatform.getInstanceById(instanceId);
