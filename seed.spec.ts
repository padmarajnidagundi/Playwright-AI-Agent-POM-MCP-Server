import { test, expect } from '@playwright/test';

/**
 * Seed test — bootstraps the IndiaRealTime app for the Playwright AI agents.
 * The planner agent runs this test to set up the environment before exploring
 * and generating test scenarios. It also serves as a canonical example of
 * the project's testing style for the generator agent.
 */
test('seed', async ({ page }) => {
  await page.goto('https://indiarealtime.com');
  await expect(page).toHaveTitle(/india.*real.*time|indiarealtime/i);
});
