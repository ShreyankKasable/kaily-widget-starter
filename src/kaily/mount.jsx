// ─────────────────────────────────────────────────────────────────────────────
// Mount logic — decides WHERE the widget renders based on config.mount.
//   "floating" → creates its own host <div> appended to <body> (a launcher in
//                the corner). The page needs no markup for this.
//   "inline"   → renders into the element matching config.mount.target, so the
//                widget sits inside your own page layout (e.g. a full-page chat).
// This is part of the SDK layer — you normally don't need to touch it.
// ─────────────────────────────────────────────────────────────────────────────

import { createRoot } from "react-dom/client";
import { config } from "../config";

const HOST_ID = "kaily-widget-root";

/**
 * Find (inline) or create (floating) the DOM node to render into.
 * @returns {HTMLElement}
 */
function resolveHost() {
  const { mode, target } = config.mount;

  if (mode === "inline") {
    const el = document.querySelector(target);
    if (!el) {
      throw new Error(
        `[kaily-widget] inline mount target not found: "${target}". ` +
          `Add an element matching it, or set config.mount.mode to "floating".`,
      );
    }
    return el;
  }

  // floating (default): our own host element, created once.
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement("div");
    host.id = HOST_ID;
    document.body.appendChild(host);
  }
  return host;
}

/**
 * Mount a widget component onto the page using the configured mount mode.
 * @param {import("react").ComponentType} Widget  The root widget component.
 * @returns {import("react-dom/client").Root}
 */
export function mountWidget(Widget) {
  const host = resolveHost();
  const root = createRoot(host);
  root.render(<Widget />);
  console.log(`[kaily-widget] mounted (${config.mount.mode}) into`, host);
  return root;
}
