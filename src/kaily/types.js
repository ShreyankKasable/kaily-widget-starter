// JSDoc type definitions for the widget configuration.
// These give you editor autocomplete + inline docs on `config.js` without
// needing TypeScript. They are types only — this file ships no runtime code.

/**
 * @typedef {Object} WidgetTheme
 * @property {string} title         Header title shown at the top of the chat panel.
 * @property {string} primaryColor  Accent color (launcher, user bubbles, buttons).
 * @property {string} launcherIcon  Icon/emoji shown on the floating launcher button.
 * @property {"bottom-right" | "bottom-left"} position  Launcher corner on the page.
 */

/**
 * @typedef {Object} WidgetMount
 * @property {"floating" | "inline"} mode  "floating" = launcher bubble; "inline" = mount into `target`.
 * @property {string} target  CSS selector to render into when mode is "inline".
 */

/**
 * @typedef {Object} WidgetFeatures
 * @property {boolean} threads      Conversation history panel.
 * @property {boolean} attachments  File uploads in the composer.
 * @property {boolean} suggestions  Suggested replies.
 * @property {boolean} feedback     Thumbs up/down on bot replies.
 * @property {boolean} voiceCall    Voice calls (advanced).
 * @property {boolean} videoCall    Video calls (advanced).
 */

/**
 * @typedef {Object} WidgetConfig
 * @property {string} token           Bot token from the Kaily dashboard.
 * @property {string} serviceBaseUrl  Kaily API base URL.
 * @property {string} surfaceClient   Surface identifier, e.g. "web".
 * @property {"production" | "uat" | "sit"} [environment]  Optional cluster shortcut; OVERRIDES serviceBaseUrl when set.
 * @property {WidgetTheme} theme      Branding.
 * @property {WidgetMount} mount      Where/how the widget mounts.
 * @property {WidgetFeatures} features  Feature toggles.
 */

export {};
