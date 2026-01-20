import { test, expect } from '@playwright/test';
import { urls } from '../data/urls';

test.describe('XSS Protection', () => {
  test('should not execute injected script in input', async ({ page }) => {
    await page.goto(urls.demoSite);
    await page.fill('input[name="search"]', '<img src=x onerror=alert(1) />');
    await page.click('button[type="submit"]');
    // Check that no alert is shown
    const dialogs: string[] = [];
    page.on('dialog', dialog => {
      dialogs.push(dialog.message());
      dialog.dismiss();
    });
    await page.waitForTimeout(1000);
    expect(dialogs).toHaveLength(0);
  });
});