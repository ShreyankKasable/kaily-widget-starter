// The floating launcher button. Clicking it opens the chat panel.
export function Launcher({ accent, icon, side, onClick }) {
  return (
    <button
      className={`kw-launcher ${side}`}
      style={{ background: accent }}
      onClick={onClick}
      aria-label="Open chat"
    >
      {icon}
    </button>
  );
}
