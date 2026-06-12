// deploy.js — build + deploy the custom widget to the CDN.
// Uses CopilotPlatform.deploy() directly — no createBotInstance, no init call.
import { CopilotPlatform } from "@kaily-ai/chat-sdk";
import { config } from "./src/config.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// PAT proves you own the agent. Put it in src/config.js as `pat`,
// or export BOLTIC_PAT in your shell — never commit it.
const pat = config.pat || process.env.BOLTIC_PAT;
if (!pat) {
  console.error("✗ Missing PAT. Set config.pat or BOLTIC_PAT env var.");
  process.exit(1);
}

const platform = CopilotPlatform.getInstance({
  surfaceClient: config.surfaceClient,
  environment: config.environment,
});

try {
  const url = await platform.deploy(
    config.token,
    path.join(__dirname, "src/index.jsx"),
    { pat },
  );
  console.log("\n✓ Deployed! Embed URL:", url);
  console.log(`  <script src="${url}"></script>`);
  process.exit(0);
} catch (err) {
  console.error("✗ Deploy failed:", err.message);
  process.exit(1);
}
