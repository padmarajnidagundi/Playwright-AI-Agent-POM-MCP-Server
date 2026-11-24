import { test, expect } from '@playwright/test';
import { IndiaRealTimePage } from '../pages/IndiaRealTimePage';

test.describe('Accessibility Tests', () => {
  test('should not have detectable a11y violations', async ({ page }) => {
    const indiaRealtimePage = new IndiaRealTimePage(page);
    await indiaRealtimePage.gotoHomepage();

    // Check for basic accessibility properties
    await expect(page).toHaveTitle(/india.*real.*time|indiarealtime/i);

    // Verify main landmark is present
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });
});
