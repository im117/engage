import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from "vite-plugin-fs";
import { config } from 'dotenv';

config();
// import { dirname, resolve } from 'node:path'
// import { fileURLToPath } from 'node:url'

// const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fs()],
  base: "./",
  root:"./",
  define: {
    'process.env': process.env
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        upload: "./upload.html"
      },
    },
  },
})

interface ImportMetaEnv {
  readonly UPLOAD_SERVER: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
