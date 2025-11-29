import { test, expect } from '@playwright/test';
import { WeSendCVPage } from './pages/WeSendCVPage';
import { URLS } from './data/urls';

test.describe('WeSendCV smoke checks', () => {
  let wesendcvPage: WeSendCVPage;

  test.beforeEach(async ({ page }) => {
    wesendcvPage = new WeSendCVPage(page);
  });

  test('homepage loads, title and main visible, save screenshot', async ({ page }, testInfo) => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify title exists
    const title = await wesendcvPage.getPageTitle();
    expect(title.length).toBeGreaterThan(0);

    // Verify homepage content is visible
    await wesendcvPage.verifyHomepageLoaded();

    // Save screenshot
    const shot = testInfo.outputPath('wesendcv-home.png');
    await wesendcvPage.takeScreenshot(shot);
  });

  test('invalid page returns 404 error', async () => {
    // Navigate to invalid page
    const resp = await wesendcvPage.gotoInvalidPage(URLS.wesendcv.invalidPage);
    expect(resp && resp.status()).toBe(404);

    // Verify 404 error is displayed (graceful fallback)
    await wesendcvPage.verify404ErrorDisplayed();
  });
});
