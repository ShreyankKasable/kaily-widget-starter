// Deploys the widget to the Kaily CDN. Run `npm run deploy`.
// Uses CopilotBot.deploy() — no socket connection is made (start() is never called).
import { CopilotBot } from "@kaily-ai/chat-sdk";
import { config } from "./src/config.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bot = new CopilotBot({
  token: config.token,
  serviceBaseUrl: config.serviceBaseUrl,
  environment: config.environment,
  surfaceClient: "web",
});

try {
  const url = await bot.deploy(path.join(__dirname, "src/index.jsx"));
  console.log("\n✓ Deployed! Embed URL:", url);
  console.log(`  <script src="${url}"></script>`);
} catch (err) {
  console.error("✗ Deploy failed:", err.message);
  process.exit(1);
}
