import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders the chat transcript and keeps it scrolled to the latest message.
// Bot replies arrive as Markdown (images, links, lists, bold, …) and are
// rendered with react-markdown. User messages are shown as plain text.
export function MessageList({ messages, accent }) {
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="kw-messages" ref={listRef}>
      {messages.length === 0 && (
        <div className="kw-empty">Ask me anything to get started.</div>
      )}
      {messages.map((m) => (
        <div key={m.id} className={`kw-msg kw-${m.role}`}>
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
        </div>
      ))}
    </div>
  );
}
