import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/questions": "http://app:8000",
      "/attempt": "http://app:8000",
      "/next-question": "http://app:8000",
      "/stats": "http://app:8000",
      "/metadata": "http://app:8000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
