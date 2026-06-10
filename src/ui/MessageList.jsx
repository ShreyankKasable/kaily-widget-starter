import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 👍/👎 on a bot reply. Locks after the first vote.
function Feedback({ messageId, onFeedback }) {
  const [rating, setRating] = useState(null);
  const pick = (r) => {
    if (rating) return;
    setRating(r);
    onFeedback?.(messageId, r);
  };
  return (
    <div className="kw-feedback">
      <button
        className={rating === "POSITIVE" ? "kw-fb-on" : ""}
        onClick={() => pick("POSITIVE")}
        aria-label="Good response"
      >
        👍
      </button>
      <button
        className={rating === "NEGATIVE" ? "kw-fb-on" : ""}
        onClick={() => pick("NEGATIVE")}
        aria-label="Bad response"
      >
        👎
      </button>
    </div>
  );
}

// Renders the chat transcript and keeps it scrolled to the latest message.
// Bot replies arrive as Markdown (images, links, lists, bold, …) and are
// rendered with react-markdown. User messages are shown as plain text.
export function MessageList({
  messages,
  accent,
  suggestions,
  onPickSuggestion,
  feedbackEnabled,
  onFeedback,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="kw-messages" ref={listRef}>
      {messages.length === 0 &&
        (suggestions ? (
          <div className="kw-suggestions">
            {suggestions.greeting && (
              <div className="kw-sg-greeting">{suggestions.greeting}</div>
            )}
            {suggestions.text && (
              <div className="kw-sg-text">{suggestions.text}</div>
            )}
            <div className="kw-sg-chips">
              {suggestions.prompts.map((p, i) => (
                <button
                  key={i}
                  className="kw-sg-chip"
                  onClick={() => onPickSuggestion?.(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="kw-empty">Ask me anything to get started.</div>
        ))}
      {messages.map((m) => (
        <div key={m.id} className={`kw-msg kw-${m.role}`}>
          <div className="kw-msg-col">
            <div
              className="kw-bubble"
              style={
                m.role === "user" ? { background: accent, color: "#fff" } : undefined
              }
            >
            {m.role === "bot" ? (
              m.text ? (
                <div className="kw-md">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Open any links in a new tab.
                      a: (props) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                </div>
              ) : (
                "…"
              )
            ) : (
              m.text
            )}

            {m.files?.length > 0 && (
              <div className="kw-msg-files">
                {m.files.map((f, i) => (
                  <a
                    key={i}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kw-file-link"
                  >
                    📎 {f.name}
                  </a>
                ))}
              </div>
            )}
            </div>

            {feedbackEnabled && m.role === "bot" && m.text && (
              <Feedback messageId={m.serverId || m.id} onFeedback={onFeedback} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
