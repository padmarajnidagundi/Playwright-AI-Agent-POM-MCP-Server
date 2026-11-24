import { test, expect } from '@playwright/test';
import { IndiaRealTimePage } from '../pages/IndiaRealTimePage';

/**
 * Integration Tests: End-to-End Workflows
 * Focus: Testing complete user journeys across multiple pages/components
 */

test.describe('Integration Tests - E2E Workflows', () => {
  let indiaRealtimePage: IndiaRealTimePage;

  test.beforeEach(async ({ page }) => {
    indiaRealtimePage = new IndiaRealTimePage(page);
  });

  test('should complete full homepage visit workflow', async ({ page }) => {
    // Navigate to homepage
    const response = await indiaRealtimePage.gotoHomepage();
    expect(response?.ok()).toBeTruthy();

    // Verify page loaded with expected content
    await indiaRealtimePage.verifyHomepageLoaded();

    // Check page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Verify page is interactive
    const isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should handle multi-step navigation workflow', async ({ page }) => {
    // Step 1: Load homepage
    await indiaRealtimePage.gotoHomepage();
    const currentUrl = page.url();
    expect(currentUrl).toContain('indiarealtime.com');

    // Step 2: Verify content presence
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).toBeTruthy();

    // Step 3: Check for navigation elements
    const links = await page.locator('a').count();
    expect(links).toBeGreaterThan(0);
  });

  test('should handle invalid page navigation gracefully', async () => {
    // Attempt to navigate to non-existent page
    const response = await indiaRealtimePage.gotoInvalidPage(
      '/invalid-page-that-does-not-exist'
    );

    // Verify 404 status code is returned
    expect(response?.status()).toBe(404);

    // Verify page does not load successfully
    expect(response?.ok()).toBeFalsy();

    // Verify 404 error indication is present (if page displays it)
    await indiaRealtimePage.verify404ErrorDisplayed();
  });
});
