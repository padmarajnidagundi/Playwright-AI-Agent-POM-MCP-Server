import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('critical path: homepage to job page', async ({ page }) => {
  const weSend = new WeSendCVPage(page);
  await weSend.gotoHomepage();
  await weSend.verifyHomepageLoaded();

  // Click on the first job link
  await weSend.clickFirstJobLink();

  // Verify job page loaded (check for job title or content)
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('text=/job|position/i')).toBeVisible();
});

test('404 error handling', async ({ page }) => {
  const weSend = new WeSendCVPage(page);
  await weSend.gotoInvalidPage('/non-existent-page');
  await weSend.verify404ErrorDisplayed();
});
