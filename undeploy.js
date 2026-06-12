// undeploy.js — remove the deployed custom widget from the CDN.
// Uses CopilotPlatform.undeploy() directly — no createBotInstance, no init call.
import { CopilotPlatform } from "@kaily-ai/chat-sdk";
import { config } from "./src/config.js";

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
  await platform.undeploy(config.token, { pat });
  console.log("✓ Undeployed successfully.");
  process.exit(0);
} catch (err) {
  console.error("✗ Undeploy failed:", err.message);
  process.exit(1);
}
