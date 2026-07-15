import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://127.0.0.1:4187',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'PORT=4187 node server.mjs',
    url: 'http://127.0.0.1:4187/healthz',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
