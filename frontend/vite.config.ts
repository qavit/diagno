import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/questions": "http://127.0.0.1:8000",
      "/attempt": "http://127.0.0.1:8000",
      "/next-question": "http://127.0.0.1:8000",
      "/stats": "http://127.0.0.1:8000",
      "/metadata": "http://127.0.0.1:8000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
