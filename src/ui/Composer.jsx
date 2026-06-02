import { useState } from "react";

// The text input + send button at the bottom of the panel.
// While a reply is streaming, the Send button becomes a Stop button.
export function Composer({ accent, sending, ready, onSend, onStop }) {
  const [input, setInput] = useState("");

  const submit = () => {
    const text = input.trim();
    if (!text || sending || !ready) return;
    onSend(text);
    setInput("");
  };

  return (
    <div className="kw-input">
      <input
        type="text"
        placeholder={ready ? "Type a message…" : "Connecting…"}
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
        <button style={{ background: accent }} onClick={submit} disabled={!ready}>
          Send
        </button>
      )}
    </div>
  );
}
