import { test, expect } from '@playwright/test';

/**
 * Seed test — bootstraps the WeSendCV app for the Playwright AI agents.
 * The planner agent runs this test to set up the environment before exploring
 * and generating test scenarios. It also serves as a canonical example of
 * the project's testing style for the generator agent.
 */
test('seed', async ({ page }) => {
  await page.goto('https://www.wesendcv.com');
  await expect(page).toHaveTitle(/wesendcv/i);
});
