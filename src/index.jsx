// Bootstrap entry — self-mounts the widget onto the page.
// When this bundle loads (locally or from the CDN), the widget appears on its own.
import { mountWidget } from "./kaily/mount";
import { config } from "./config";

// TEMPORARY mount marker for Step 4 — proves the mount works and lets you test
// floating vs inline by flipping config.mount.mode. Replaced by the real
// launcher + chat panel (the Widget) in Step 6.
function MountMarker() {
  const accent = config.theme.primaryColor;
  if (config.mount.mode === "inline") {
    return (
      <div
        style={{
          padding: 16,
          border: `2px dashed ${accent}`,
          borderRadius: 8,
          font: "13px/1.4 system-ui, sans-serif",
          color: accent,
        }}
      >
        Kaily widget mounted here (inline). Chat UI arrives in a later step.
      </div>
    );
  }
  return (
    <div
      title="Kaily widget mount point (placeholder)"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: accent,
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      }}
    />
  );
}

mountWidget(MountMarker);
