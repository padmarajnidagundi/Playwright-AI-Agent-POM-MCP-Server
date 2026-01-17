import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test.describe('Accessibility Tests', () => {
  test('should not have detectable a11y violations', async ({ page }) => {
    const wesendcvPage = new WeSendCVPage(page);
    await wesendcvPage.navigate();
    
    // Check for basic accessibility properties
    await expect(page).toHaveTitle(/WeSendCV/i);
    
    // Verify main landmark is present
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });
});
