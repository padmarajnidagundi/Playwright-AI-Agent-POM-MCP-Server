import { test, expect } from '@playwright/test';
import { IndiaRealTimePage } from './pages/IndiaRealTimePage';

test.describe('Mobile testing example', () => {
  let indiaRealtimePage: IndiaRealTimePage;

  test.beforeEach(async ({ page }) => {
    indiaRealtimePage = new IndiaRealTimePage(page);
  });

  test('homepage loads on mobile', async () => {
    // Navigate to homepage
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify title exists
    const title = await indiaRealtimePage.getPageTitle();
    expect(title.length).toBeGreaterThan(0);

    // Verify homepage content is visible
    await indiaRealtimePage.verifyHomepageLoaded();
  });
});
