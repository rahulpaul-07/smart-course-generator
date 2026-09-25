import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the real stack: the production build served by
 * `vite preview`, talking to the Express API running on an in-memory MongoDB
 * (`npm run dev:memory`, which also seeds showcase content and enables guest
 * accounts). No external services or API keys: with no provider configured
 * the AI router uses its deterministic mock mode.
 */
const WEB_PORT = 4173;
const API_PORT = 8000;

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /responsive\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: [
    {
      command: 'npm --prefix ../backend run dev:memory',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { PORT: String(API_PORT), CLIENT_URL: `http://localhost:${WEB_PORT}`, DEMO_MODE: 'true' },
    },
    {
      command: `npm run build && npm run preview -- --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: { VITE_API_BASE_URL: `http://localhost:${API_PORT}/api` },
    },
  ],
});
