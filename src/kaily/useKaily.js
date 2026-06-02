// ─────────────────────────────────────────────────────────────────────────────
// useKaily — the single React hook the UI uses to talk to the bot.
// Connects on mount, and exposes the chat state + a send() that streams replies.
// Later steps grow this to expose threads, tools, files, suggestions, feedback,
// and voice/video — so every SDK method ends up here, in one documented place.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "./client";

/**
 * @typedef {"connecting" | "ready" | "error"} KailyStatus
 * @typedef {{ id: string, role: "user" | "bot", text: string }} ChatMessage
 */

let msgSeq = 0;
const nextId = (p) => `${p}-${Date.now()}-${msgSeq++}`;

export function useKaily() {
  const [bot, setBot] = useState(/** @type {any} */ (null));
  const [status, setStatus] = useState(/** @type {KailyStatus} */ ("connecting"));
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  const [messages, setMessages] = useState(/** @type {ChatMessage[]} */ ([]));
  const [sending, setSending] = useState(false);

  // The active conversation thread id, kept in a ref so it survives re-renders
  // without re-triggering send().
  const threadId = useRef(/** @type {string | null} */ (null));

  // Set true when the user hits Stop, so late stream callbacks are ignored.
  const stopped = useRef(false);

  // ── Connect once on mount ──────────────────────────────────────────────────
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

    return () => {
      active = false;
    };
  }, []);

  // ── Send a message and stream the reply ────────────────────────────────────
  const send = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || !bot || sending) return;

      const botId = nextId("b");
      stopped.current = false;
      // Optimistically add the user's message + an empty bot bubble to fill in.
      setMessages((list) => [
        ...list,
        { id: nextId("u"), role: "user", text: trimmed },
        { id: botId, role: "bot", text: "" },
      ]);
      setSending(true);

      // Update the in-progress bot bubble: append a chunk, or replace it whole.
      const patchBot = (chunk, replace = false) =>
        setMessages((list) =>
          list.map((m) =>
            m.id === botId
              ? { ...m, text: replace ? chunk : m.text + chunk }
              : m,
          ),
        );

      // The reply streams over a socket, so bot.message() resolves early. End the
      // "sending" state when the stream actually finalizes (replyListener), not
      // when the promise resolves — otherwise the Stop button only flashes.
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        setSending(false);
      };

      const lastContent = (res) => {
        const arr = Array.isArray(res?.data)
          ? res.data
          : res?.data?.messages || [res?.data];
        return arr?.[arr.length - 1]?.content || "";
      };

      try {
        const res = await bot.message(
          {
            text: trimmed,
            thread_id: threadId.current || undefined,
            path: window.location.pathname || "/",
          },
          {
            // Stream the reply token by token.
            deltaListener: (r) => {
              if (stopped.current) return;
              patchBot(r?.data?.content || "");
            },
            // Final answer — capture the thread id, set full text, end the stream.
            replyListener: (r) => {
              if (stopped.current) return;
              if (r?.data?.thread_id) threadId.current = r.data.thread_id;
              const content = lastContent(r);
              if (content) patchBot(content, true);
              finish();
            },
          },
        );
        // Fallback: some setups return the final content directly instead of via
        // replyListener. Only finalize here if it actually carries content;
        // otherwise keep waiting for the socket stream.
        if (!finished && !stopped.current) {
          const content = lastContent(res);
          if (content) {
            patchBot(content, true);
            finish();
          }
        }
      } catch (e) {
        console.error("[kaily-widget] message failed:", e);
        if (!stopped.current) patchBot("Sorry, something went wrong.", true);
        finish();
      }
    },
    [bot, sending],
  );

  // ── Stop the in-progress reply ─────────────────────────────────────────────
  const stop = useCallback(async () => {
    if (!bot || !sending) return;
    // Ignore any further stream callbacks and stop right away.
    stopped.current = true;
    setSending(false);
    try {
      await bot.stopMessage({ thread_id: threadId.current || undefined });
    } catch (e) {
      console.error("[kaily-widget] stop failed:", e);
    }
  }, [bot, sending]);

  return { bot, status, error, messages, sending, send, stop };
}
