import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Stable vendor chunks: app deploys don't invalidate the cached
        // framework code, which changes far less often.
        codeSplitting: {
          groups: [
            // react-dom/server is only used by the lazily loaded PDF exporter.
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom(?![\\/](server|cjs[\\/]react-dom-server))|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    // Only run unit/component tests under src. Playwright specs live in e2e/
    // and must NOT be collected by vitest (they import @playwright/test).
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "playwright.config.ts", "node_modules/**", "dist/**"],
  },
})
