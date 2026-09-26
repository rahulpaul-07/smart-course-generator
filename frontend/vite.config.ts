import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// The SPA calls the API same-origin under /api (see src/utils/api.ts). Locally
// that path is proxied to the Express server; in production the host rewrites
// it (vercel.json).
const apiProxy = {
  '/api': {
    target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
    changeOrigin: true,
  },
}

/**
 * The production security headers live in vercel.json. `vite preview` serves
 * the same set, so the Playwright suite (which runs against preview) fails if a
 * CSP change breaks the app instead of that surfacing only after a deploy.
 */
function productionHeaders(): Record<string, string> {
  const config = JSON.parse(readFileSync(path.join(import.meta.dirname, 'vercel.json'), 'utf8')) as {
    headers?: { source: string; headers: { key: string; value: string }[] }[]
  }
  const all = config.headers?.find((rule) => rule.source === '/(.*)')?.headers ?? []
  return Object.fromEntries(all.map(({ key, value }) => [key, value]))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
    headers: productionHeaders(),
  },
  build: {
    // The one chunk above the 500 kB default is html2pdf (~735 kB), which is
    // only fetched by a dynamic import when the user exports a lesson PDF.
    chunkSizeWarningLimit: 800,
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
