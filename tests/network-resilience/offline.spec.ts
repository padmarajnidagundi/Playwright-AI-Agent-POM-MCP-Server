import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('page handles offline/network failure gracefully', async ({ page }) => {
  // Simulate offline by aborting all network requests
  await page.route('**/*', (route) => route.abort());

  const weSend = new WeSendCVPage(page);

  // Attempt to navigate; expect it to fail or show error
  try {
    await weSend.gotoHomepage();
    // If it somehow loads (cached), check for error indicators
    await expect(
      page.locator('text=/network|offline|connection/i')
    ).toBeVisible({ timeout: 5000 });
  } catch (error) {
    // Navigation failed, which is expected in offline mode
    expect(error.message).toContain('net::ERR_FAILED');
  }
});

test('page recovers when network is restored', async ({ page }) => {
  const abortAllRequests = (route) => route.abort();
  await page.route('**/*', abortAllRequests);

  const weSend = new WeSendCVPage(page);

  // First navigation should fail while offline.
  await expect(weSend.gotoHomepage()).rejects.toThrow(/ERR_FAILED|net::ERR/i);

  // Restore network and verify the page can load again.
  await page.unroute('**/*', abortAllRequests);
  await weSend.gotoHomepage();
  await weSend.verifyHomepageLoaded();
});
