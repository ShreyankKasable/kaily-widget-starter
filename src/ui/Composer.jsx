import { useRef, useState } from "react";

// The text input + send button. Optionally supports file attachments:
// a 📎 button uploads a file, shows it as a chip, and includes it on send.
// While a reply is streaming, the Send button becomes a Stop button.
export function Composer({
  accent,
  sending,
  ready,
  onSend,
  onStop,
  attachmentsEnabled,
  onUpload,
}) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const submit = () => {
    const text = input.trim();
    if ((!text && attachments.length === 0) || sending || !ready || uploading) return;
    onSend(text, attachments);
    setInput("");
    setAttachments([]);
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setUploading(true);
    try {
      const ref = await onUpload(file);
      setAttachments((a) => [...a, ref]);
    } catch (err) {
      console.error("[kaily-widget] upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="kw-composer">
      {attachments.length > 0 && (
        <div className="kw-attachments">
          {attachments.map((f, i) => (
            <span key={i} className="kw-chip">
              📎 {f.name}
              <button
                onClick={() =>
                  setAttachments((a) => a.filter((_, j) => j !== i))
                }
                aria-label="Remove attachment"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="kw-input">
        {attachmentsEnabled && (
          <>
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              onChange={onFile}
            />
            <button
              className="kw-attach"
              onClick={() => fileRef.current?.click()}
              disabled={!ready || uploading}
              aria-label="Attach file"
              title="Attach file"
            >
              📎
            </button>
          </>
        )}

        <input
          type="text"
          placeholder={
            uploading ? "Uploading…" : ready ? "Type a message…" : "Connecting…"
          }
          value={input}
          disabled={!ready}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        {sending ? (
          <button className="kw-stop" onClick={onStop} aria-label="Stop generating">
            ■ Stop
          </button>
        ) : (
          <button
            style={{ background: accent }}
            onClick={submit}
            disabled={!ready || uploading}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}
