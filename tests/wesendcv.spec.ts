import { test, expect } from '@playwright/test';

test.describe('WeSendCV smoke checks', () => {
  test('homepage loads, title and main visible, save screenshot', async ({ page }, testInfo) => {
    const url = 'https://wesendcv.com';

    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    expect(resp && resp.ok()).toBeTruthy();

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Ensure body/main is visible
    await expect(page.locator('body')).toBeVisible();

    // Attempt to assert that some main content exists (header/main/h1)
    const main = page.locator('main, header, [role="main"], h1');
    await expect(main.first()).toBeVisible();

    // Save a full page screenshot as an artifact
    const shot = testInfo.outputPath('wesendcv-home.png');
    await page.screenshot({ path: shot, fullPage: true });
    testInfo.attachments = testInfo.attachments || {};
  });
});
