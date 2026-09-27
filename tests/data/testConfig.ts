/**
 * testConfig.ts — Centralized test configuration constants.
 *
 * All timeouts, thresholds, and environment-dependent values live here so
 * that individual tests never hard-code magic numbers.
 */

export const TEST_CONFIG = {
  // ── Timeouts ────────────────────────────────────────────────────────────────
  timeouts: {
    /** Default navigation timeout (ms) */
    navigation: 60_000,
    /** Default element visibility timeout (ms) */
    element: 10_000,
    /** Short wait for UI animations to settle (ms) */
    settle: 300,
    /** Maximum time for a single retry cycle (ms) */
    retry: 5_000,
  },

  // ── Performance thresholds ──────────────────────────────────────────────────
  performance: {
    /** Maximum acceptable page load time (ms) */
    maxLoadTimeMs: 5_000,
    /** Maximum acceptable First Contentful Paint (ms) */
    maxFCPMs: 2_500,
    /** Maximum acceptable Time to First Byte (ms) */
    maxTTFBMs: 800,
  },

  // ── Retry policy ────────────────────────────────────────────────────────────
  retry: {
    /** Number of retries for flaky network actions */
    networkActions: 3,
    /** Base delay between retries in ms (doubles each attempt) */
    baseDelayMs: 500,
  },

  // ── Accessibility ────────────────────────────────────────────────────────────
  a11y: {
    /** axe-core rule tags to include in accessibility scans */
    ruleTags: ['wcag2a', 'wcag2aa', 'best-practice'],
    /** Severity levels that should fail a test */
    failSeverity: ['critical', 'serious'] as string[],
  },

  // ── Visual diff ─────────────────────────────────────────────────────────────
  visual: {
    /** Pixel-match threshold (0–1). 0.03 = 3% tolerance */
    pixelMatchThreshold: 0.03,
  },

  // ── Environment ─────────────────────────────────────────────────────────────
  env: {
    baseURL: process.env.E2E_BASE_URL || 'https://wesendcv.com',
    apiToken: process.env.E2E_API_TOKEN || '',
    isCI: Boolean(process.env.CI),
  },
} as const;
