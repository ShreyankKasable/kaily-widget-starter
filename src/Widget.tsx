import { useEffect, useRef, useState } from "preact/hooks";
import { CopilotPlatform } from "@kaily-ai/chat-sdk";
import { WidgetConfig } from "./index";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

/**
 * A minimal chat widget: a floating launcher button that opens a panel where you
 * can send a message and stream the agent's reply. This is intentionally small —
 * add threads, file uploads, suggestions, voice, etc. as you need them (see the
 * full @kaily-ai/chat-sdk surface).
 */
export function Widget({ config }: { config: WidgetConfig }) {
  const botRef = useRef<any>(null);
  const threadId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // ── Connect once on mount ───────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const platform = CopilotPlatform.getInstance({
          serviceBaseUrl: config.serviceBaseUrl,
          surfaceClient: "web",
        });
        const bot = await platform.createBotInstance(config.token);
        if (active) botRef.current = bot;
      } catch (e) {
        console.error("[kaily-widget] failed to connect", e);
      }
    })();
    return () => {
      active = false;
    };
  }, [config.token, config.serviceBaseUrl]);

  // Keep the message list scrolled to the bottom.
  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    const bot = botRef.current;
    if (!text || !bot || sending) return;

    const botId = "b-" + Date.now();
    setMessages((m) => [
      ...m,
      { id: "u-" + Date.now(), sender: "user", text },
      { id: botId, sender: "bot", text: "" },
    ]);
    setInput("");
    setSending(true);

    const patchBot = (chunk: string, replace = false) =>
      setMessages((list) =>
        list.map((m) =>
          m.id === botId ? { ...m, text: replace ? chunk : m.text + chunk } : m,
        ),
      );

    try {
      await bot.message(
        {
          text,
          thread_id: threadId.current || undefined,
          path: window.location.pathname || "/",
        },
        {
          // Stream the reply token by token.
          deltaListener: (res: any) => patchBot(res?.data?.content || ""),
          // Final answer — capture the thread id so the conversation continues.
          replyListener: (res: any) => {
            if (res?.data?.thread_id) threadId.current = res.data.thread_id;
            const arr = Array.isArray(res?.data)
              ? res.data
              : res?.data?.messages || [res?.data];
            const last = arr[arr.length - 1] || {};
            if (last.content) patchBot(last.content, true);
          },
        },
      );
    } catch (e) {
      patchBot("Sorry, something went wrong.", true);
    } finally {
      setSending(false);
    }
  };

  const accent = config.primaryColor || "#7a5af5";

  if (!open) {
    return (
      <button
        class="kw-launcher"
        style={{ background: accent }}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  return (
    <div class="kw-panel">
      <div class="kw-header" style={{ background: accent }}>
        <span>{config.title || "Assistant"}</span>
        <button class="kw-close" onClick={() => setOpen(false)} aria-label="Close chat">
          ×
        </button>
      </div>

      <div class="kw-messages" ref={listRef}>
        {messages.length === 0 && (
          <div class="kw-empty">Ask me anything to get started.</div>
        )}
        {messages.map((m) => (
          <div key={m.id} class={`kw-msg kw-${m.sender}`}>
            <div
              class="kw-bubble"
              style={m.sender === "user" ? { background: accent, color: "#fff" } : undefined}
            >
              {m.text || "…"}
            </div>
          </div>
        ))}
      </div>

      <div class="kw-input">
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button style={{ background: accent }} onClick={send} disabled={sending}>
          Send
        </button>
      </div>
    </div>
  );
}
