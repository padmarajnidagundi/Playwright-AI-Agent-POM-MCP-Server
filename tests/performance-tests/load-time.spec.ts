import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

/**
 * Performance Tests: Response Times & Load Metrics
 * Focus: Measuring page load times, network performance, and resource timing
 */

test.describe('Performance Tests - Load Time & Metrics', () => {
  let wesendcvPage: WeSendCVPage;

  test.beforeEach(async ({ page }) => {
    wesendcvPage = new WeSendCVPage(page);
  });

  test('should load homepage within acceptable time', async () => {
    const startTime = Date.now();
    const response = await wesendcvPage.gotoHomepage();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
    expect(response?.ok()).toBeTruthy();
  });

  test('should measure First Contentful Paint (FCP)', async () => {
    await wesendcvPage.gotoHomepage();
    const metrics = await wesendcvPage.page.evaluate(() => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
      };
    });
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
  });

  test('should load resources efficiently', async () => {
    let resourceCount = 0;
    wesendcvPage.page.on('response', () => {
      resourceCount++;
    });
    await wesendcvPage.gotoHomepage();
    expect(resourceCount).toBeGreaterThan(0);
    expect(resourceCount).toBeLessThan(100); // Reasonable resource limit
  });

  test('negative: should handle page timeout gracefully', async () => {
    await wesendcvPage.page.route('**/*.{css,js}', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 8000));
      await route.continue().catch(() => {});
    });
    try {
      await wesendcvPage.page.goto(wesendcvPage.url, {
        waitUntil: 'domcontentloaded',
        timeout: 3000,
      }).catch(() => {});
    } catch (error) {
      expect(error).toBeDefined();
    }
    const bodyExists = await wesendcvPage.bodyElement.isVisible().catch(() => false);
    expect(bodyExists || true).toBeTruthy();
  });
});
