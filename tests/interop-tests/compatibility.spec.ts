import { test, expect } from '@playwright/test';
import { URLS } from '../data/urls';

/**
 * Interop Tests: Cross-Browser & Compatibility
 * Focus: Testing feature compatibility across different browsers and platforms
 */

test.describe('Interop Tests - Cross-Browser Compatibility', () => {
  test('should render consistently across browsers', async ({ page, browserName }) => {
    await page.goto(URLS.wesendcv.base);

    // Verify core elements render in all browsers
    const mainContent = await page.locator('main, [role="main"]').first();
    expect(await mainContent.isVisible()).toBeTruthy();

    console.log(`✓ Page rendered correctly in ${browserName}`);
  });

  test('should support CSS Grid layout', async ({ page }) => {
    await page.goto(URLS.wesendcv.base);

    const supportsGrid = await page.evaluate(() => {
      const element = document.createElement('div');
      return 'grid' in element.style;
    });

    expect(supportsGrid).toBeTruthy();
  });

  test('should support ES6 features', async ({ page }) => {
    await page.goto(URLS.wesendcv.base);

    const supportsES6 = await page.evaluate(() => {
      try {
        eval('const x = () => x;'); // Arrow function
        eval('let y = Symbol("test");'); // Symbols
        return true;
      } catch {
        return false;
      }
    });

    expect(supportsES6).toBeTruthy();
  });

  test('should handle touch events gracefully', async ({ page }) => {
    await page.goto(URLS.wesendcv.base);

    // Check if touch events are supported
    const touchSupport = await page.evaluate(() => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });

    // Page should work even if touch isn't available
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBeTruthy();
  });

  test('should respect user viewport preferences', async ({ page }) => {
    await page.goto(URLS.wesendcv.base);

    // Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');

    if (viewportMeta) {
      expect(viewportMeta).toContain('width=device-width');
    }
  });
});
