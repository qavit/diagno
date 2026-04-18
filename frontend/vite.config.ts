import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/questions": "http://localhost:8001",
      "/attempt": "http://localhost:8001",
      "/next-question": "http://localhost:8001",
      "/stats": "http://localhost:8001",
      "/metadata": "http://localhost:8001",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
