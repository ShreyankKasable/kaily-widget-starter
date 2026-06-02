import { useEffect, useState } from "react";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Slides over the chat panel to list past conversations. Selecting one reloads
// it; "New conversation" starts fresh.
export function HistoryPanel({ accent, listThreads, onSelect, onNew, onClose }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listThreads()
      .then((t) => active && setThreads(t))
      .catch((e) => console.error("[kaily-widget] listThreads failed:", e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [listThreads]);

  return (
    <div className="kw-history">
      <div className="kw-header" style={{ background: accent }}>
        <span>Conversations</span>
        <button className="kw-close" onClick={onClose} aria-label="Close history">
          ×
        </button>
      </div>

      <button className="kw-new" onClick={onNew}>
        + New conversation
      </button>

      <div className="kw-history-list">
        {loading && <div className="kw-empty">Loading…</div>}
        {!loading && threads.length === 0 && (
          <div className="kw-empty">No past conversations</div>
        )}
        {threads.map((t) => (
          <button key={t.id} className="kw-thread" onClick={() => onSelect(t.id)}>
            <div className="kw-thread-title">{t.title}</div>
            {t.updatedAt && (
              <div className="kw-thread-date">{formatDate(t.updatedAt)}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
