// TEMPORARY connection test for Step 3 — verifies the platform client connects.
// Replaced by the real self-mount + Widget bootstrap in Step 4.
import { connect } from "./kaily/client";

connect()
  .then(({ bot }) => {
    console.log("[kaily-widget] ✅ connected. bot:", bot);
  })
  .catch((err) => {
    console.error("[kaily-widget] ❌ connection failed:", err);
  });
