// ─────────────────────────────────────────────────────────────────────────────
// Widget — the chat UI root. Composes the launcher + chat panel and wires them
// to the useKaily hook. This is the main file to edit when you customize the UI.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { config } from "../config";
import { useKaily } from "../kaily/useKaily";
import { Launcher } from "./Launcher";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { HistoryPanel } from "./HistoryPanel";
import "./styles.css";

export function Widget() {
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { status, messages, sending, send, stop, listThreads, loadThread, newThread } =
    useKaily();

  const accent = config.theme.primaryColor;
  const side = config.theme.position === "bottom-left" ? "kw-left" : "";
  const threadsEnabled = config.features.threads;

  if (!open) {
    return (
      <Launcher
        accent={accent}
        icon={config.theme.launcherIcon}
        side={side}
        onClick={() => setOpen(true)}
      />
    );
  }

  return (
    <div className={`kw-panel ${side}`}>
      <div className="kw-header" style={{ background: accent }}>
        <span>{config.theme.title}</span>
        <div className="kw-header-actions">
          {threadsEnabled && (
            <button
              className="kw-icon-btn"
              onClick={() => setShowHistory(true)}
              aria-label="Conversation history"
              title="Conversation history"
            >
              🕑
            </button>
          )}
          <button
            className="kw-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>
      </div>

      <MessageList messages={messages} accent={accent} />

      <Composer
        accent={accent}
        sending={sending}
        ready={status === "ready"}
        onSend={send}
        onStop={stop}
      />

      {threadsEnabled && showHistory && (
        <HistoryPanel
          accent={accent}
          listThreads={listThreads}
          onSelect={(id) => {
            loadThread(id);
            setShowHistory(false);
          }}
          onNew={() => {
            newThread();
            setShowHistory(false);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
