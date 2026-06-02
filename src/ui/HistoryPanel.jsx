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
// it; you can also rename, delete, or clear all conversations.
export function HistoryPanel({
  accent,
  listThreads,
  onSelect,
  onNew,
  onClose,
  updateThread,
  deleteThread,
  deleteAllThreads,
}) {
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

  const rename = async (t) => {
    const title = window.prompt("Rename conversation", t.title);
    if (!title || title === t.title) return;
    await updateThread(t.id, title);
    setThreads((list) => list.map((x) => (x.id === t.id ? { ...x, title } : x)));
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this conversation?")) return;
    await deleteThread(id);
    setThreads((list) => list.filter((x) => x.id !== id));
  };

  const clearAll = async () => {
    if (!window.confirm("Delete ALL conversations?")) return;
    await deleteAllThreads();
    setThreads([]);
  };

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
          <div key={t.id} className="kw-thread">
            <button className="kw-thread-main" onClick={() => onSelect(t.id)}>
              <div className="kw-thread-title">{t.title}</div>
              {t.updatedAt && (
                <div className="kw-thread-date">{formatDate(t.updatedAt)}</div>
              )}
            </button>
            <div className="kw-thread-actions">
              <button onClick={() => rename(t)} title="Rename" aria-label="Rename">
                ✏️
              </button>
              <button onClick={() => remove(t.id)} title="Delete" aria-label="Delete">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {threads.length > 0 && (
        <button className="kw-clear-all" onClick={clearAll}>
          Clear all conversations
        </button>
      )}
    </div>
  );
}
