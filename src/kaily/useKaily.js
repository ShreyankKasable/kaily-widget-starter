// ─────────────────────────────────────────────────────────────────────────────
// useKaily — the single React hook the UI uses to talk to the bot.
// Connects on mount, and exposes the chat state + a send() that streams replies.
// Later steps grow this to expose threads, tools, files, suggestions, feedback,
// and voice/video — so every SDK method ends up here, in one documented place.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "./client";
import { config } from "../config";
import { plugins } from "../plugins";

/**
 * @typedef {"connecting" | "ready" | "error"} KailyStatus
 * @typedef {{ id: string, role: "user" | "bot", text: string }} ChatMessage
 */

let msgSeq = 0;
const nextId = (p) => `${p}-${Date.now()}-${msgSeq++}`;

// The SDK may return lists in several shapes — normalize them to plain arrays.
function pickArray(res, ...keys) {
  if (Array.isArray(res)) return res;
  for (const k of keys) {
    if (Array.isArray(res?.data?.[k])) return res.data[k];
  }
  if (Array.isArray(res?.data)) return res.data;
  for (const k of keys) {
    if (Array.isArray(res?.[k])) return res[k];
  }
  return [];
}

function normalizeThreads(res) {
  return pickArray(res, "threads", "items", "result")
    .map((t) => ({
      id: t.id || t.thread_id || t._id || "",
      title: t.title || t.preview || t.name || "Conversation",
      updatedAt: t.updated_at || t.created_at || null,
    }))
    .filter((t) => t.id);
}

// The thread id can arrive under different keys (or only on bot.currentThreadId).
function pickThreadId(res, bot) {
  return (
    res?.data?.thread_id ||
    res?.data?.threadId ||
    res?.thread_id ||
    res?.threadId ||
    bot?.currentThreadId ||
    null
  );
}

// Read a File as a base64 data URL (the SDK expects `data_url` on uploads).
function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Pull the final assistant text out of a reply/result payload.
function lastContent(res) {
  const arr = Array.isArray(res?.data)
    ? res.data
    : res?.data?.messages || [res?.data];
  return arr?.[arr.length - 1]?.content || "";
}

function normalizeMessages(res) {
  return (
    pickArray(res, "messages", "items", "result")
      // Keep only chat messages (drop system/event rows).
      .filter((m) => ["user", "assistant", "bot"].includes(m.role))
      .map((m, i) => ({
        id: m.id || m._id || `m-${i}`,
        role: m.role === "assistant" || m.role === "bot" ? "bot" : "user",
        text: m.content || m.text || m.message || "",
      }))
      .filter((m) => m.text)
      // The API returns newest-first; show oldest-first like the live chat.
      .reverse()
  );
}

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

  // The id of the bot bubble currently being streamed into. The SDK caches its
  // socket listeners per thread (only the first message()'s listeners are kept),
  // so the listeners MUST target this ref — not a per-send closure — or replies
  // to later messages would overwrite the first reply.
  const activeBotId = useRef(/** @type {string | null} */ (null));

  // True once the current reply has finalized (so the result-fallback and
  // listener don't both end the turn).
  const finished = useRef(true);

  // Latest bot instance, readable from the stable listeners below.
  const botRef = useRef(/** @type {any} */ (null));
  useEffect(() => {
    botRef.current = bot;
  }, [bot]);

  // ── Connect once on mount ──────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    setStatus("connecting");

    connect()
      .then(async ({ bot }) => {
        if (!active) return;
        // Identify the user before the first message so the conversation is
        // scoped correctly. config.user → setUser; otherwise stay anonymous.
        try {
          if (config.user) await bot.setUser(config.user);
          else await bot.unsetUser();
          if (config.context) await bot.setContext(config.context);
          // Register client tools so the assistant can call them.
          if (plugins.length) await bot.addTool(plugins);
        } catch (e) {
          console.error("[kaily-widget] identity/context/tools failed:", e);
        }
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

  // Write into the bot bubble that's currently streaming (append or replace).
  const patchActive = useCallback((chunk, replace = false) => {
    const id = activeBotId.current;
    if (!id) return;
    setMessages((list) =>
      list.map((m) =>
        m.id === id ? { ...m, text: replace ? chunk : m.text + chunk } : m,
      ),
    );
  }, []);

  // End the current turn (idempotent — the listener and the result-fallback may
  // both try). The reply streams over a socket, so bot.message() resolves early;
  // we end "sending" when the reply finalizes, not when the promise resolves.
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setSending(false);
  }, []);

  // Stable listeners reused for EVERY message. They target the active bubble via
  // refs, so the SDK's per-thread listener cache (it keeps only the first
  // message's listeners) can never misroute a reply into an older bubble.
  const listeners = useMemo(
    () => ({
      // Stream the reply token by token.
      deltaListener: (r) => {
        if (stopped.current) return;
        patchActive(r?.data?.content || "");
      },
      // Final answer — capture the thread id, set full text, end the stream.
      replyListener: (r) => {
        if (stopped.current) return;
        const tid = pickThreadId(r, botRef.current);
        if (tid) threadId.current = tid;
        const content = lastContent(r);
        if (content) patchActive(content, true);
        finish();
      },
      // The SDK calls these directly, so they must exist. Hook them up if you
      // want to show "thinking"/tool-running status in the UI.
      progressListener: () => {},
      toolMessageListener: () => {},
      toolComponentMessageListener: () => {},
    }),
    [patchActive, finish],
  );

  // ── Send a message and stream the reply ────────────────────────────────────
  const send = useCallback(
    async (text, attachments = []) => {
      const trimmed = (text || "").trim();
      if ((!trimmed && attachments.length === 0) || !bot || sending) return;

      const botId = nextId("b");
      activeBotId.current = botId;
      stopped.current = false;
      finished.current = false;
      // Optimistically add the user's message + an empty bot bubble to fill in.
      setMessages((list) => [
        ...list,
        { id: nextId("u"), role: "user", text: trimmed, files: attachments },
        { id: botId, role: "bot", text: "" },
      ]);
      setSending(true);

      try {
        const res = await bot.message(
          {
            text: trimmed,
            thread_id: threadId.current || undefined,
            path: window.location.pathname || "/",
            ...(attachments.length
              ? {
                  files: attachments.map((f) => ({
                    name: f.name,
                    type: f.type,
                    size: f.size,
                    data_url: f.data_url,
                    url: f.url,
                    cdn_path: f.cdn_path,
                    fileId: f.fileId,
                    imageUrl: f.imageUrl,
                  })),
                }
              : {}),
          },
          listeners,
        );
        // The thread id can also arrive on the result — capture it so follow-up
        // messages continue the same conversation.
        const tid = pickThreadId(res, bot);
        if (tid) threadId.current = tid;
        // Fallback: some setups return the final content directly instead of via
        // replyListener. Only finalize here if it carries content; otherwise
        // keep waiting for the socket stream.
        if (!finished.current && !stopped.current) {
          const content = lastContent(res);
          if (content) {
            patchActive(content, true);
            finish();
          }
        }
      } catch (e) {
        console.error("[kaily-widget] message failed:", e);
        if (!stopped.current) patchActive("Sorry, something went wrong.", true);
        finish();
      }
    },
    [bot, sending, listeners, patchActive, finish],
  );

  // ── Stop the in-progress reply ─────────────────────────────────────────────
  const stop = useCallback(async () => {
    if (!bot || !sending) return;
    // Ignore any further stream callbacks and stop right away.
    stopped.current = true;
    finished.current = true;
    setSending(false);
    try {
      await bot.stopMessage({ thread_id: threadId.current || undefined });
    } catch (e) {
      console.error("[kaily-widget] stop failed:", e);
    }
  }, [bot, sending]);

  // ── Identity ───────────────────────────────────────────────────────────────
  // Call these to identify the user at runtime, e.g. after they log in/out.
  const setUser = useCallback(
    /** @param {import("./types").KailyUser} user */
    (user) => bot?.setUser(user),
    [bot],
  );
  const unsetUser = useCallback(() => bot?.unsetUser(), [bot]);

  // ── Context & data ─────────────────────────────────────────────────────────
  // setContext: give the assistant situational info. captureData: record
  // structured data (e.g. lead capture / analytics).
  const setContext = useCallback((context) => bot?.setContext(context), [bot]);
  const captureData = useCallback((data) => bot?.captureData(data), [bot]);

  // ── Client tools (plugins) ─────────────────────────────────────────────────
  // Register/remove tools at runtime. Tools in plugins.js are added on connect.
  const addTool = useCallback((tools) => bot?.addTool(tools), [bot]);
  const removeTool = useCallback((name) => bot?.removeTool(name), [bot]);
  const removeAllTools = useCallback(() => bot?.removeAllTools(), [bot]);
  const getFrontendActions = useCallback(() => bot?.getFrontendActions(), [bot]);

  // ── Thread history ─────────────────────────────────────────────────────────
  // listThreads → past conversations; loadThread → reload one into the chat;
  // newThread → start a fresh conversation.
  const listThreads = useCallback(
    async ({ page = 1, limit = 20 } = {}) => {
      if (!bot) return [];
      return normalizeThreads(await bot.getThreads({ page, limit }));
    },
    [bot],
  );

  const loadThread = useCallback(
    async (id) => {
      if (!bot || !id) return;
      threadId.current = id;
      // limit caps how many recent messages load; add cursor pagination
      // (response.page.next) yourself if you need the full history.
      setMessages(normalizeMessages(await bot.getMessages({ threadId: id, limit: 50 })));
    },
    [bot],
  );

  const newThread = useCallback(() => {
    threadId.current = null;
    setMessages([]);
  }, []);

  // Rename a conversation.
  const updateThread = useCallback(
    (id, title) => bot?.updateThread({ threadId: id, title }),
    [bot],
  );

  // Delete one conversation; if it's the open one, clear the chat.
  const deleteThread = useCallback(
    async (id) => {
      if (!bot || !id) return;
      await bot.deleteThread(id);
      if (threadId.current === id) {
        threadId.current = null;
        setMessages([]);
      }
    },
    [bot],
  );

  // Delete every conversation and clear the chat.
  const deleteAllThreads = useCallback(async () => {
    if (!bot) return;
    await bot.deleteAllThreads({});
    threadId.current = null;
    setMessages([]);
  }, [bot]);

  // Update a stored message's data. Used to persist interactive state back onto
  // a message — e.g. a dropdown/form selection inside a bot reply:
  //   updateMessage(threadId, messageId, { tools: [{ type: "dropdown", selectedOptions }] })
  const updateMessage = useCallback(
    (tId, messageId, data) => bot?.updateMessage(tId, messageId, data),
    [bot],
  );

  // ── Files ──────────────────────────────────────────────────────────────────
  // Upload a File (gets a signed URL, then PUTs the file) and return a reference
  // you pass as the 2nd arg to send(): send(text, [ref]).
  const uploadFile = useCallback(
    async (file) => {
      if (!bot) throw new Error("[kaily-widget] not connected");
      const data_url = await readDataUrl(file);
      const res = await bot.getUploadUrl({
        namespace: "client-files",
        options: {
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          data_url,
        },
      });
      const url = res?.url || res?.data?.url;
      await bot.upload(url, file, file.type);
      // The server validates these fields on the message — keep them all.
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        data_url,
        url,
        cdn_path: res?.cdn_path || res?.data?.cdn_path,
        fileId: res?.fileId || res?.data?.fileId,
        imageUrl: res?.imageUrl || res?.data?.imageUrl,
      };
    },
    [bot],
  );

  // Give the assistant a set of reference documents for the current thread.
  // Each document: { path, name, size, type }.
  const setDocuments = useCallback(
    (documents) =>
      bot?.setDocuments({ documents, threadId: threadId.current || undefined }),
    [bot],
  );

  // Attach a custom HTML component (string) to a specific message.
  const uploadHtmlComponent = useCallback(
    (html, messageId) => bot?.uploadHtmlComponent(html, messageId),
    [bot],
  );

  return {
    bot,
    status,
    error,
    messages,
    sending,
    send,
    stop,
    setUser,
    unsetUser,
    setContext,
    captureData,
    addTool,
    removeTool,
    removeAllTools,
    getFrontendActions,
    listThreads,
    loadThread,
    newThread,
    updateThread,
    deleteThread,
    deleteAllThreads,
    updateMessage,
    uploadFile,
    setDocuments,
    uploadHtmlComponent,
  };
}
