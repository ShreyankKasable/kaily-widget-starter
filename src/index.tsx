import { render } from "preact";
import { Widget } from "./Widget";
import "./widget.css";

/**
 * 👉 The only required config: your bot token (from the Kaily dashboard) and the
 * Kaily API base URL. Edit these, then `npm run deploy`.
 */
export interface WidgetConfig {
  token: string;
  serviceBaseUrl: string;
  /** Header title shown at the top of the chat panel. */
  title?: string;
  /** Accent color used for the launcher and user bubbles. */
  primaryColor?: string;
}

const config: WidgetConfig = {
  token: "cat-c7ghiybb",
  serviceBaseUrl: "https://asia-south1.public.copilotz0.de",
  title: "Assistant",
  primaryColor: "#7a5af5",
};

// Self-mount: create a host element on the page and render into it. When this
// bundle is loaded (locally or from the CDN), the widget appears on its own.
const container = document.createElement("div");
container.id = "kaily-widget-root";
document.body.appendChild(container);

render(<Widget config={config} />, container);
