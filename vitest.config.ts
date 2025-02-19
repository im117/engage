
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ["data", "dist", "initdb", "media", "node_modules", "src"],
    globals: true,
    environment: "jsdom", // Simulates a browser environment for React components
    css: true, // Allows CSS imports in tests
  },
});
