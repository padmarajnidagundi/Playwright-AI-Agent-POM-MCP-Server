import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

/**
 * Integration Tests: End-to-End Workflows
 * Focus: Testing complete user journeys across multiple pages/components
 */

test.describe('Integration Tests - E2E Workflows', () => {
  let wesendcvPage: WeSendCVPage;

  test.beforeEach(async ({ page }) => {
    wesendcvPage = new WeSendCVPage(page);
  });

  test('should complete full homepage visit workflow', async ({ page }) => {
    // Navigate to homepage
    const response = await wesendcvPage.gotoHomepage();
    expect(response?.ok()).toBeTruthy();

    // Verify page loaded with expected content
    await wesendcvPage.verifyHomepageLoaded();

    // Check page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Verify page is interactive
    const isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should handle multi-step navigation workflow', async ({ page }) => {
    // Step 1: Load homepage
    await wesendcvPage.gotoHomepage();
    let currentUrl = page.url();
    expect(currentUrl).toContain('wesendcv.com');

    // Step 2: Verify content presence
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();

    // Step 3: Check for navigation elements
    const links = await page.locator('a').count();
    expect(links).toBeGreaterThan(0);
  });

  test('should handle invalid page navigation gracefully', async ({ page }) => {
    // Attempt to navigate to non-existent page
    const response = await wesendcvPage.gotoInvalidPage('/invalid-page-that-does-not-exist');
    
    // Verify 404 status code is returned
    expect(response?.status()).toBe(404);

    // Verify page does not load successfully
    expect(response?.ok()).toBeFalsy();

    // Verify 404 error indication is present (if page displays it)
    await wesendcvPage.verify404ErrorDisplayed();
  });
});
