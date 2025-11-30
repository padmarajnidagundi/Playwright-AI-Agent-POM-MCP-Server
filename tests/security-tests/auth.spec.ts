import { test, expect } from '@playwright/test';
import { URLS } from '../data/urls';

/**
 * Security Tests: Authentication & Authorization Checks
 * Focus: Validating secure access control and sensitive data handling
 */

test.describe('Security Tests - Auth & Access Control', () => {
  test('should enforce HTTPS protocol', async ({ page }) => {
    const response = await page.goto(URLS.wesendcv.base);
    const url = page.url();

    // Verify HTTPS is used
    expect(url).toMatch(/^https:\/\//);
    expect(response?.status()).toBeLessThan(400);
  });

  test('should not expose sensitive headers', async ({ page }) => {
    const response = await page.goto(URLS.wesendcv.base);
    const headers = await response?.allHeaders();

    if (headers) {
      // Check that sensitive headers are not publicly exposed
      expect(headers['x-api-key']).toBeUndefined();
      expect(headers['authorization']).toBeUndefined();
    }
  });

  test('should handle unauthorized access gracefully', async ({ page }) => {
    // Attempt to access a protected/non-existent resource
    const response = await page.goto(URLS.wesendcv.base + '/admin', {
      waitUntil: 'networkidle',
    });

    // Should either redirect or return 404/403
    expect([301, 302, 404, 403]).toContain(response?.status());
  });

  test('should prevent XSS injection in page content', async ({ page }) => {
    await page.goto(URLS.wesendcv.base);

    // Verify page content doesn't contain unescaped script tags
    const bodyHTML = await page.content();
    expect(bodyHTML).not.toContain('<script>alert');
    expect(bodyHTML).not.toContain('javascript:');
  });
});
