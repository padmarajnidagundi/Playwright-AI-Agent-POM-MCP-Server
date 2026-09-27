import type { Page } from '@playwright/test';

// helpers & small utilities
export function parseCurrency(text: string) {
  // robustly parse currency, strip non-numeric except dot and minus
  const cleaned = (text || '').replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned || '0');
}

export async function waitForNavigationIfNeeded(
  page: Page,
  action: () => Promise<void>
) {
  // use Playwright built-in waitWhen navigation may or may not occur
  await Promise.all([action(), page.waitForLoadState('load')]);
}

/**
 * Retry an async function up to `maxAttempts` times with linear back-off
 * (delay grows as `delayMs × attempt`).
 *
 * For exponential back-off, use `BasePage.retryAction` instead.
 * Resolves with the first successful result or rejects after exhausting attempts.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 500
): Promise<T> {
  let lastError: Error;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError!;
}

/**
 * Measure elapsed time for an async operation.
 * Returns `{ result, durationMs }`.
 */
export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, durationMs: Date.now() - start };
}

/**
 * Structured console logger for AI-parseable output.
 * In CI environments each message is prefixed with a JSON tag.
 */
export function aiLog(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
): void {
  const entry = { ts: new Date().toISOString(), level, message, ...data };
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
}

/**
 * Wait for the page to reach a "network idle" state within the given timeout.
 * Falls back silently if the timeout is exceeded (avoids flaky failures on
 * pages that keep polling the network).
 */
export async function waitForNetworkIdle(page: Page, timeoutMs = 5_000): Promise<void> {
  await page
    .waitForLoadState('networkidle', { timeout: timeoutMs })
    .catch(() => {/* non-fatal */});
}

