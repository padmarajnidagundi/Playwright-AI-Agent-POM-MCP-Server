import { test as base, APIRequestContext, request } from '@playwright/test';

export type CustomFixtures = {
  /** APIRequestContext pre-configured with the base URL and auth headers */
  apiContext: APIRequestContext;
};

/**
 * Extended Playwright test with custom fixtures.
 *
 * Usage:
 *   import { test, expect } from '../fixtures';
 *
 * Available fixtures:
 *   - `apiContext`  Pre-authorised APIRequestContext (respects E2E_BASE_URL env)
 *   - `page`        Standard Playwright page with auto-tracing on failure
 */
export const test = base.extend<CustomFixtures>({
  // ── apiContext fixture ────────────────────────────────────────────────────
  apiContext: async ({}, use) => {
    const baseURL = process.env.E2E_BASE_URL || 'https://wesendcv.com';
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (process.env.E2E_API_TOKEN) {
      headers['Authorization'] = 'Bearer ' + process.env.E2E_API_TOKEN;
    }
    const ctx = await request.newContext({ baseURL, extraHTTPHeaders: headers });
    await use(ctx);
    await ctx.dispose();
  },

  // ── Auto-tracing page fixture ─────────────────────────────────────────────
  // Automatically starts a Playwright trace and saves it on test failure.
  page: async ({ page }, use, testInfo) => {
    await page.context().tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });

    await use(page);

    if (testInfo.status !== testInfo.expectedStatus) {
      const tracePath = testInfo.outputPath('trace.zip');
      await page.context().tracing.stop({ path: tracePath });
      testInfo.attachments.push({
        name: 'trace',
        path: tracePath,
        contentType: 'application/zip',
      });
    } else {
      await page.context().tracing.stop();
    }
  },
});

export { expect } from '@playwright/test';
