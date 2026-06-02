// ─────────────────────────────────────────────────────────────────────────────
// useKaily — the single React hook the UI uses to talk to the bot.
// For now it just connects (Step 5). Later steps grow it to expose messaging,
// threads, tools, files, suggestions, feedback, and voice/video — so every SDK
// method ends up here, in one documented place.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { connect } from "./client";

/**
 * @typedef {"connecting" | "ready" | "error"} KailyStatus
 */

/**
 * Connect to the Kaily bot once on mount and expose the connection.
 * @returns {{
 *   bot: import("@kaily-ai/chat-sdk").CopilotBot | null,
 *   status: KailyStatus,
 *   error: Error | null,
 * }}
 */
export function useKaily() {
  const [bot, setBot] = useState(/** @type {any} */ (null));
  const [status, setStatus] = useState(/** @type {KailyStatus} */ ("connecting"));
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  useEffect(() => {
    let active = true;
    setStatus("connecting");

    connect()
      .then(({ bot }) => {
        if (!active) return;
        setBot(bot);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        console.error("[kaily-widget] connection failed:", err);
        setError(err);
        setStatus("error");
      });

    // Ignore a late resolve if the component unmounts mid-connect.
    return () => {
      active = false;
    };
  }, []);

  return { bot, status, error };
}
