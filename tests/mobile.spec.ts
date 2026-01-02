import { test, expect } from '@playwright/test';
import { WeSendCVPage } from './pages/WeSendCVPage';

test.describe('Mobile testing example', () => {
  let wesendcvPage: WeSendCVPage;

  test.beforeEach(async ({ page }) => {
    wesendcvPage = new WeSendCVPage(page);
  });

  test('homepage loads on mobile', async () => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify title exists
    const title = await wesendcvPage.getPageTitle();
    expect(title.length).toBeGreaterThan(0);

    // Verify homepage content is visible
    await wesendcvPage.verifyHomepageLoaded();
  });
});
