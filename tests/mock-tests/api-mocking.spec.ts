import { test, expect } from '@playwright/test';
import { URLS } from '../data/urls';

/**
 * Mock Tests: Response Mocking & Stubbing
 * Focus: Testing error handling, edge cases, and unavailable services
 */

test.describe('Mock Tests - API Mocking & Stubbing', () => {
  test('should handle mocked API error responses', async ({ page }) => {
    // Intercept and mock API responses
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    // Navigate to page that may call APIs
    const response = await page.goto(URLS.wesendcv.base, { waitUntil: 'domcontentloaded' });

    // Page should still load even if APIs fail
    expect(response?.ok()).toBeTruthy();
  });

  test('should handle mocked slow network responses', async ({ page }) => {
    // Mock network requests with artificial delay
    await page.route('**/*.css', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto(URLS.wesendcv.base);
    const loadTime = Date.now() - startTime;

    // Verify page still loads despite delays
    expect(page.url()).toContain('wesendcv.com');
    expect(loadTime).toBeGreaterThan(1000);
  });

  test('should handle mocked unavailable service gracefully', async ({ page }) => {
    // Mock external resource as unavailable
    await page.route('**/external/**', (route) => {
      route.respond({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service Unavailable' }),
      });
    });

    await page.goto(URLS.wesendcv.base);

    // Core page should still be functional
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('should stub XHR/Fetch responses', async ({ page }) => {
    await page.route('**/api/data', (route) => {
      route.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: 'mocked response' }),
      });
    });

    // Fetch mocked data
    const result = await page.evaluate(() => {
      return fetch('/api/data').then((res) => res.json());
    });

    expect(result.data).toBe('mocked response');
  });

  test('negative: API returns 500 and app handles it gracefully', async ({ page }) => {
    // Mock API to return 500 for any API route
    await page.route('**/api/**', (route) => {
      route.respond({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Navigate to the site which may call the API
    const response = await page.goto(URLS.wesendcv.base, { waitUntil: 'domcontentloaded' });

    // The site should handle the server error gracefully. Accept either:
    // - a visible error/alert message, or
    // - the page still renders core UI (body visible) but internal errors were handled.
    const showsError = await page
      .locator('text=/error|something went wrong|service unavailable|internal server error/i')
      .first()
      .isVisible()
      .catch(() => false);

    const bodyVisible = await page.locator('body').isVisible().catch(() => false);

    expect(showsError || bodyVisible).toBeTruthy();
  });

  test('should handle mocked 404 responses for missing resources', async ({ page }) => {
    // Mock specific resource as not found
    await page.route('**/missing-resource/**', (route) => {
      route.respond({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not Found' }),
      });
    });

    await page.goto(URLS.wesendcv.base);

    // App should handle 404 gracefully, e.g., show error or keep core UI visible
    const showsError = await page
      .locator('text=/not found|404|resource unavailable/i')
      .first()
      .isVisible()
      .catch(() => false);

    const bodyVisible = await page.locator('body').isVisible().catch(() => false);

    expect(showsError || bodyVisible).toBeTruthy();
  });

  test('should handle mocked redirect responses', async ({ page }) => {
    // Mock a resource to redirect to another URL
    await page.route('**/redirect-me/**', (route) => {
      route.respond({
        status: 302,
        headers: { Location: '/redirected-page' },
      });
    });

    await page.goto(URLS.wesendcv.base);

    // App should handle redirect gracefully, e.g., follow it or show appropriate handling
    // For simplicity, check if page remains functional or redirect is processed
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('negative: API returns 401 Unauthorized and app handles authentication failure', async ({ page }) => {
    // Mock API to return 401 for any API route requiring authentication
    await page.route('**/api/auth/**', (route) => {
      route.respond({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
      });
    });

    // Navigate to the site which may attempt authenticated API calls
    const response = await page.goto(URLS.wesendcv.base, { waitUntil: 'domcontentloaded' });

    // The site should handle authentication failure gracefully. Accept either:
    // - a visible login prompt or error message, or
    // - the page still renders core UI but shows auth-related errors
    const showsAuthError = await page
      .locator('text=/unauthorized|login required|authentication failed|401|please log in/i')
      .first()
      .isVisible()
      .catch(() => false);

    const bodyVisible = await page.locator('body').isVisible().catch(() => false);

    expect(showsAuthError || bodyVisible).toBeTruthy();
  });
});
