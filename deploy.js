// Deploys the widget to the Kaily CDN. Run `npm run deploy`.
// seraph's deploy() bundles src/index.jsx (JS + CSS) and uploads it — we just call it.
import { deploy } from "@kaily-ai/chat-sdk/deploy";
import { config } from "./src/config.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = await deploy(path.join(__dirname, "src/index.jsx"), {
  token: config.token,
  ...(config.environment
    ? { environment: config.environment }
    : { serviceBaseUrl: config.serviceBaseUrl }),
});

console.log("\n✓ Deployed! Embed URL:", url);
console.log(`  <script src="${url}"></script>`);
