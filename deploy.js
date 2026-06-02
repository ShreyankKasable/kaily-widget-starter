// Deploys the built widget to the Kaily CDN (run `npm run build` first, or use
// `npm run deploy`). Set your token and API base URL below.
const path = require("node:path");
const { deploy } = require("@kaily-ai/chat-sdk");

(async () => {
  const url = await deploy(path.join(__dirname, "dist/widget.js"), {
    token: "cat-c7ghiybb",
    serviceBaseUrl: "http://localhost:3000",
  });
  console.log("\n✓ Deployed! Embed URL:", url);
})();
