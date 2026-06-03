import { useEffect, useRef, useState } from "react";

// Video call via Anam (talking avatar). initiateWebVideoCall returns an Anam
// session token; createClient + client.stream() gives the avatar video.
// Anam captures the user's speech and fires MESSAGE_HISTORY_UPDATED; we relay
// each user message through videoCallMessage and speak the reply with client.talk().
export function VideoCall({ startVideoCall, sendVideoMessage, endVideoCall, onClose }) {
  const videoRef = useRef(null);
  const clientRef = useRef(null);
  const lastRelayed = useRef("");
  const [status, setStatus] = useState("connecting"); // connecting | live | ended

  const hangUp = async () => {
    setStatus("ended");
    try {
      await clientRef.current?.stopStreaming?.();
    } catch (e) {
      console.error("[kaily-widget] stopStreaming failed:", e);
    }
    clientRef.current = null;
    try {
      await endVideoCall();
    } catch (e) {
      console.error("[kaily-widget] endVideoCall failed:", e);
    }
    onClose?.();
  };

  const relay = async (text) => {
    try {
      await sendVideoMessage(
        text,
        {
          // Speak streamed/partial content and the final reply via the avatar.
          progressListener: (p) =>
            p?.data?.content && clientRef.current?.talk(p.data.content),
          replyListener: (d) => {
            const c = d?.data?.messages?.[0]?.content;
            if (c) clientRef.current?.talk(c);
          },
          deltaListener: () => {},
          toolMessageListener: () => {},
        },
        { endVideoCallListener: () => hangUp() },
      );
    } catch (e) {
      console.error("[kaily-widget] videoCallMessage failed:", e);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await startVideoCall();
        const token = res?.data?.token || res?.data?.accessToken;
        if (!token) throw new Error("No Anam token in video call data");

        const { createClient, AnamEvent } = await import("@anam-ai/js-sdk");
        const client = createClient(token);
        clientRef.current = client;

        client.addListener(AnamEvent.SESSION_READY, () => {
          if (!cancelled) setStatus("live");
        });
        client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (messages) => {
          const last = messages?.[messages.length - 1];
          if (last?.role === "user" && last.content && last.content !== lastRelayed.current) {
            lastRelayed.current = last.content;
            relay(last.content);
          }
        });

        const [videoStream] = await client.stream();
        if (!cancelled && videoRef.current && videoStream) {
          videoRef.current.srcObject = videoStream;
        }
      } catch (e) {
        console.error("[kaily-widget] video call failed:", e);
        if (!cancelled) hangUp();
      }
    })();

    return () => {
      cancelled = true;
      clientRef.current?.stopStreaming?.().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="kw-videocall">
      <video ref={videoRef} autoPlay playsInline className="kw-video" />
      <div className="kw-video-status">
        {status === "connecting"
          ? "Connecting…"
          : status === "live"
            ? "● Live — just speak"
            : "Call ended"}
      </div>
      <button className="kw-video-end" onClick={hangUp}>
        End call
      </button>
    </div>
  );
}
