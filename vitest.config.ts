import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ["data", "dist", "initdb", "media", "node_modules", "src"],
  },
})