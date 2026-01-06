import { test, expect } from '@playwright/test';
import { URLS } from '../data/urls';

/**
 * Ping Tests: Basic connectivity and endpoint availability
 * Focus: Verifying that URLs and endpoints are reachable
 */

test.describe('Ping Tests - Endpoint Availability', () => {
  test('should ping base URL successfully', async ({ page }) => {
    // Navigate to the base URL
    const response = await page.goto(URLS.wesendcv.base, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Verify the response status is 200 (OK)
    expect(response?.status()).toBe(200);
  });

  test('should ping homepage endpoint', async ({ page }) => {
    // Navigate to the homepage
    const response = await page.goto(URLS.wesendcv.home, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Verify the response status is 200 (OK)
    expect(response?.status()).toBe(200);
  });

  test('negative: invalid endpoint should return 404', async ({ page }) => {
    // Navigate to an invalid endpoint
    const response = await page.goto(
      `${URLS.wesendcv.base}${URLS.wesendcv.invalidPage}`,
      {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      }
    );

    // Verify the response status is 404 (Not Found)
    expect(response?.status()).toBe(404);
  });
});
