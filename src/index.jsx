// Bootstrap entry — self-mounts the widget onto the page.
// When this bundle loads (locally or from the CDN), the widget appears on its own.
import { mountWidget } from "./kaily/mount";
import { Widget } from "./ui/Widget";

mountWidget(Widget);
