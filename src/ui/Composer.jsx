import { useState } from "react";

// The text input + send button at the bottom of the panel.
export function Composer({ accent, disabled, onSend }) {
  const [input, setInput] = useState("");

  const submit = () => {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput("");
  };

  return (
    <div className="kw-input">
      <input
        type="text"
        placeholder="Type a message…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button style={{ background: accent }} onClick={submit} disabled={disabled}>
        Send
      </button>
    </div>
  );
}
