// Bootstrap entry — self-mounts the widget onto the page.
// When this bundle loads (locally or from the CDN), the widget appears on its own.
import { mountWidget } from "./kaily/mount";
import { useKaily } from "./kaily/useKaily";
import { config } from "./config";

// TEMPORARY mount marker for Steps 4–5 — proves the mount works AND the bot
// connects. The circle color reflects connection status:
//   gray  = connecting   ·   purple = ready   ·   red = error
// Replaced by the real launcher + chat panel (the Widget) in Step 6.
function MountMarker() {
  const { status } = useKaily();

  const color =
    status === "ready"
      ? config.theme.primaryColor
      : status === "error"
        ? "#e5484d"
        : "#999";

  if (config.mount.mode === "inline") {
    return (
      <div
        style={{
          padding: 16,
          border: `2px dashed ${color}`,
          borderRadius: 8,
          font: "13px/1.4 system-ui, sans-serif",
          color,
        }}
      >
        Kaily widget mounted (inline) — status: {status}. Chat UI arrives next.
      </div>
    );
  }

  return (
    <div
      title={`Kaily widget — ${status}`}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: color,
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        transition: "background 0.3s ease",
      }}
    />
  );
}

mountWidget(MountMarker);
