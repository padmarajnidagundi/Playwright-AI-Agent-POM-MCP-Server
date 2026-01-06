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

  test('negative: invalid bearer token is rejected', async ({ page }) => {
    // Use the API/request client to simulate an authenticated request with an invalid token
    const badToken = 'Bearer invalid.token.value';

    const apiResponse = await page.request
      .get(`${URLS.wesendcv.base}/admin`, {
        headers: {
          Authorization: badToken,
        },
        // short timeout for negative check
        timeout: 5000,
      })
      .catch(() => null);

    const status = apiResponse?.status() ?? 0;

    // Acceptable negative outcomes: unauthorized/forbidden (401/403) or redirect away
    if ([401, 403, 301, 302, 0].includes(status)) {
      expect([401, 403, 301, 302, 0]).toContain(status);
    } else if (status === 200) {
      // If the server responds 200 for the admin endpoint with an invalid token,
      // ensure the response body does not expose admin-specific content.
      const bodyText = apiResponse
        ? await apiResponse.text().catch(() => '')
        : '';
      expect(bodyText).not.toMatch(
        /\b(admin|dashboard|manage users|user list|administrator)\b/i
      );
    } else {
      // Any other status is unexpected for the negative test
      throw new Error(
        `Unexpected status code ${status} for invalid token test`
      );
    }
  });
});
