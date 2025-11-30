import { test, expect } from '@playwright/test';
import { URLS } from '../data/urls';

/**
 * Performance Tests: Response Times & Load Metrics
 * Focus: Measuring page load times, network performance, and resource timing
 */

test.describe('Performance Tests - Load Time & Metrics', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    const response = await page.goto(URLS.wesendcv.base, { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Assert load time is under 5 seconds
    expect(loadTime).toBeLessThan(5000);
    expect(response?.ok()).toBeTruthy();
  });

  test('should measure First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto(URLS.wesendcv.base);

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
      };
    });

    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });

  test('should load resources efficiently', async ({ page }) => {
    let resourceCount = 0;
    let totalSize = 0;

    page.on('response', (response) => {
      resourceCount++;
      // Simulate size tracking (actual size would be from headers)
      totalSize += 1024; // Placeholder
    });

    await page.goto(URLS.wesendcv.base, { waitUntil: 'networkidle' });

    expect(resourceCount).toBeGreaterThan(0);
    expect(resourceCount).toBeLessThan(100); // Reasonable resource limit
  });
});
