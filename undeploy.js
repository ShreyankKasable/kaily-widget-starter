import { undeploy } from "@kaily-ai/chat-sdk/deploy";
import { config } from "./src/config.js";

try {
  await undeploy({
    token: config.token,
    ...(config.environment
      ? { environment: config.environment }
      : { serviceBaseUrl: config.serviceBaseUrl }),
  });
  console.log("✓ Undeployed successfully.");
} catch (err) {
  console.error("✗ Undeploy failed:", err.message);
  process.exit(1);
}
