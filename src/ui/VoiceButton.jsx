import { useRef, useState } from "react";

// Voice call via Retell. initiateWebCall() returns the connection data
// (Retell access token); RetellWebClient handles mic capture + audio playback.
// The button reflects call state: 📞 idle · ⏳ connecting · 🔴 live · 🔊 agent talking.
export function VoiceButton({ startVoiceCall, endVoiceCall }) {
  const [status, setStatus] = useState("idle"); // idle | connecting | live | speaking
  const clientRef = useRef(null);
  const busyRef = useRef(false);

  const cleanup = async () => {
    try {
      clientRef.current?.stopCall?.();
    } catch (e) {
      console.error("[kaily-widget] stopCall failed:", e);
    }
    clientRef.current = null;
    try {
      await endVoiceCall();
    } catch (e) {
      console.error("[kaily-widget] disconnectWebCall failed:", e);
    }
    setStatus("idle");
  };

  const start = async () => {
    setStatus("connecting");
    // 1. Start the call session — returns Retell connection data.
    const res = await startVoiceCall();
    const data = res?.data || res || {};
    const accessToken = data.access_token || data.accessToken;
    if (!accessToken) {
      throw new Error("No Retell access_token in call data (is the bot using Retell?)");
    }

    // 2. Retell manages the mic + audio. Lazy-import so it's only loaded on use.
    const { RetellWebClient } = await import("retell-client-js-sdk");
    const client = new RetellWebClient();
    clientRef.current = client;

    client.on("call_started", () => setStatus("live"));
    client.on("agent_start_talking", () => setStatus("speaking"));
    client.on("agent_stop_talking", () => setStatus("live"));
    client.on("call_ended", () => cleanup());
    client.on("error", (e) => {
      console.error("[kaily-widget] retell error:", e);
      cleanup();
    });

    await client.startCall({
      accessToken,
      sampleRate: data.sample_rate || data.sampleRate,
    });
  };

  const toggle = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      if (status === "idle") {
        await start();
      } else {
        await cleanup();
      }
    } catch (e) {
      console.error("[kaily-widget] voice call failed:", e);
      await cleanup();
    } finally {
      busyRef.current = false;
    }
  };

  const icon =
    status === "idle"
      ? "📞"
      : status === "connecting"
        ? "⏳"
        : status === "speaking"
          ? "🔊"
          : "🔴";

  return (
    <button
      className="kw-icon-btn"
      onClick={toggle}
      aria-label={status === "idle" ? "Start voice call" : "End voice call"}
      title={status === "idle" ? "Start voice call" : `Voice call: ${status}`}
    >
      {icon}
    </button>
  );
}
