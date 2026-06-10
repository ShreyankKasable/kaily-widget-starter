import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Local dev/preview config. Production deploy is handled by `npm run deploy`
// (seraph's deploy() bundles src/index.jsx and uploads it to the CDN).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 9101,
    open: true,
  },
});
