import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "vite-plugin-fs";

if (process.env.VITE_HMR_OVERLAY === undefined) {
  process.env.VITE_HMR_OVERLAY = "true";
}

export default defineConfig({
  plugins: [react(), fs()],
  base: "./",
  root: "./",
  server: {
    allowedHosts: ["ngage.lol", "localhost", "upload.ngage.lol", "login.ngage.lol", "isaacarch"],
    hmr: {
      overlay: process.env.VITE_HMR_OVERLAY === "true"
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html"
      },
    },
  },
});
