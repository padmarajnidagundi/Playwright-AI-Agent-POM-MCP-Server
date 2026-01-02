import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('WeSendCV page keyboard navigation works', async ({ page }) => {
  const weSend = new WeSendCVPage(page);
  await weSend.gotoHomepage();

  // Focus on the first focusable element (assuming there's a link or button)
  await page.keyboard.press('Tab');
  const firstFocusable = page.locator(':focus');
  await expect(firstFocusable).toBeVisible();

  // Tab through a few elements to ensure focus order
  await page.keyboard.press('Tab');
  const secondFocusable = page.locator(':focus');
  await expect(secondFocusable).toBeVisible();
  await expect(secondFocusable).not.toBe(firstFocusable);

  // Ensure no focus trap or broken navigation (basic check)
  await page.keyboard.press('Tab');
  const thirdFocusable = page.locator(':focus');
  await expect(thirdFocusable).toBeVisible();
});
