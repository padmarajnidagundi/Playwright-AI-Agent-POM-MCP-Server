import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'https://indiarealtime.com';
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  timeout: Number(process.env.E2E_TEST_TIMEOUT_MS) || 30_000,
  expect: { timeout: Number(process.env.E2E_EXPECT_TIMEOUT_MS) || 5_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: process.env.E2E_WORKERS
    ? Number(process.env.E2E_WORKERS)
    : isCI
      ? 2
      : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
    ['list'],
    ['./tools/ai-reporter.ts'],
  ],
  use: {
    baseURL,
    headless: true,
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
