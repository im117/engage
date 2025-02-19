import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "vite-plugin-fs";

export default defineConfig({
  plugins: [react(), fs()],
  base: "./",
  root: "./",
  server: {
    allowedHosts: ['ngage.lol'],
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        upload: "./upload.html",
      },
    },
  },
});
