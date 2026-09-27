import { Page, Locator, expect } from '@playwright/test';

export interface ActionLog {
  timestamp: string;
  action: string;
  target?: string;
  status: 'success' | 'failure' | 'retry';
  durationMs?: number;
  error?: string;
}

/**
 * BasePage — abstract Page Object base class.
 *
 * Provides:
 * - Smart retry with exponential back-off (`retryAction`)
 * - Structured action logging consumed by the AI reporter
 * - Common navigation and interaction helpers
 * - Performance timing via `measureAction`
 * - Soft-assertion helpers that never throw mid-test
 */
export abstract class BasePage {
  readonly page: Page;
  readonly actionLogs: ActionLog[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  // ─── Structured Logging ───────────────────────────────────────────────────

  protected log(
    action: string,
    status: ActionLog['status'],
    opts: { target?: string; durationMs?: number; error?: string } = {}
  ): void {
    this.actionLogs.push({
      timestamp: new Date().toISOString(),
      action,
      status,
      ...opts,
    });
  }

  /**
   * Return a plain-object summary suitable for an LLM prompt or AI reporter.
   */
  getAISummary(): object {
    const failures = this.actionLogs.filter(l => l.status === 'failure');
    const retries = this.actionLogs.filter(l => l.status === 'retry');
    return {
      totalActions: this.actionLogs.length,
      failures: failures.length,
      retries: retries.length,
      logs: this.actionLogs,
    };
  }

  // ─── Smart Retry ─────────────────────────────────────────────────────────

  /**
   * Retry an async action up to `maxAttempts` times with exponential back-off.
   *
   * @param action      Async action to attempt
   * @param label       Human-readable label for logs
   * @param maxAttempts Maximum number of attempts (default: 3)
   * @param baseDelayMs Initial delay in ms, doubles on each retry (default: 500)
   */
  async retryAction<T>(
    action: () => Promise<T>,
    label: string,
    maxAttempts = 3,
    baseDelayMs = 500
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await action();
        this.log(label, 'success');
        return result;
      } catch (err) {
        lastError = err as Error;
        if (attempt < maxAttempts) {
          this.log(label, 'retry', { error: lastError.message });
          await this.page.waitForTimeout(baseDelayMs * Math.pow(2, attempt - 1));
        }
      }
    }
    this.log(label, 'failure', { error: lastError?.message });
    throw lastError;
  }

  // ─── Performance Timing ───────────────────────────────────────────────────

  /**
   * Measure wall-clock time of an async action and log it.
   */
  async measureAction<T>(action: () => Promise<T>, label: string): Promise<T> {
    const start = Date.now();
    try {
      const result = await action();
      this.log(label, 'success', { durationMs: Date.now() - start });
      return result;
    } catch (err) {
      this.log(label, 'failure', {
        durationMs: Date.now() - start,
        error: (err as Error).message,
      });
      throw err;
    }
  }

  // ─── Navigation Helpers ───────────────────────────────────────────────────

  /**
   * Navigate to a URL and wait for the DOM to be ready.
   */
  async goto(url: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded') {
    return this.measureAction(
      () => this.page.goto(url, { waitUntil, timeout: 60_000 }),
      `goto(${url})`
    );
  }

  /**
   * Wait until a locator is both visible and stable (no layout shifts).
   */
  async waitForStable(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    // Ensure element is not moving — check bounding box twice
    const box1 = await locator.boundingBox();
    await this.page.waitForTimeout(150);
    const box2 = await locator.boundingBox();
    if (box1 && box2 && (box1.x !== box2.x || box1.y !== box2.y)) {
      // Element is still moving; wait a bit more
      await this.page.waitForTimeout(300);
    }
  }

  // ─── Interaction Helpers ──────────────────────────────────────────────────

  /**
   * Click with automatic retry and logging.
   */
  async safeClick(locator: Locator, label: string): Promise<void> {
    await this.retryAction(async () => {
      await locator.waitFor({ state: 'visible', timeout: 10_000 });
      await locator.click();
    }, `click(${label})`);
  }

  /**
   * Fill an input with automatic retry and logging.
   */
  async safeFill(locator: Locator, value: string, label: string): Promise<void> {
    await this.retryAction(async () => {
      await locator.waitFor({ state: 'visible', timeout: 10_000 });
      await locator.fill(value);
    }, `fill(${label})`);
  }

  /**
   * Scroll the element into view before interacting.
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  // ─── Assertion Helpers ────────────────────────────────────────────────────

  /**
   * Soft assertion: logs failure but does not throw.
   */
  async softAssertVisible(locator: Locator, label: string): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout: 5_000 });
      this.log(`assertVisible(${label})`, 'success');
      return true;
    } catch {
      this.log(`assertVisible(${label})`, 'failure', {
        error: `${label} was not visible`,
      });
      return false;
    }
  }

  // ─── Screenshot ───────────────────────────────────────────────────────────

  /**
   * Take a named full-page screenshot and log it.
   */
  async capture(path: string): Promise<void> {
    await this.measureAction(
      () => this.page.screenshot({ path, fullPage: true }),
      `screenshot(${path})`
    );
  }

  // ─── Abstract contract ────────────────────────────────────────────────────

  /** Each concrete Page Object must expose its primary URL. */
  abstract get url(): string;
}
