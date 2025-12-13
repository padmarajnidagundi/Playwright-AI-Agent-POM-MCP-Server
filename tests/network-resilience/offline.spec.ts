import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('page handles offline/network failure gracefully', async ({ page }) => {
  // Simulate offline by aborting all network requests
  await page.route('**/*', route => route.abort());

  const weSend = new WeSendCVPage(page);

  // Attempt to navigate; expect it to fail or show error
  try {
    await weSend.gotoHomepage();
    // If it somehow loads (cached), check for error indicators
    await expect(page.locator('text=/network|offline|connection/i')).toBeVisible({ timeout: 5000 });
  } catch (error) {
    // Navigation failed, which is expected in offline mode
    expect(error.message).toContain('net::ERR_FAILED');
  }
});