/**
 * ai-reporter.ts — Custom Playwright reporter that writes a structured JSON
 * file consumed by LLM agents, MCP tools, and chatmode prompts.
 *
 * Output: test-results/ai-report.json
 *
 * Schema:
 *   {
 *     "runId": "<ISO timestamp>",
 *     "summary": { passed, failed, skipped, total, durationMs },
 *     "tests": [
 *       {
 *         "title": "...",
 *         "file": "...",
 *         "status": "passed" | "failed" | "skipped" | "timedOut",
 *         "durationMs": 1234,
 *         "retries": 0,
 *         "error": null | { message, stack, location },
 *         "aiHint": "..." // auto-generated failure suggestion
 *       }
 *     ]
 *   }
 */

import type {
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface AITestEntry {
  title: string;
  file: string;
  project: string;
  status: TestResult['status'];
  durationMs: number;
  retries: number;
  error: { message: string; stack?: string; location?: string } | null;
  aiHint: string | null;
}

interface AIReport {
  runId: string;
  summary: {
    passed: number;
    failed: number;
    skipped: number;
    timedOut: number;
    total: number;
    durationMs: number;
  };
  tests: AITestEntry[];
}

// ── Heuristic AI hints ────────────────────────────────────────────────────────

function buildAIHint(entry: Pick<AITestEntry, 'status' | 'error'>): string | null {
  if (entry.status === 'passed' || entry.status === 'skipped') return null;

  const msg = entry.error?.message ?? '';

  if (entry.status === 'timedOut') {
    return 'Test timed out. Consider increasing the timeout, checking for slow selectors, or adding explicit waits.';
  }
  if (/locator.*not found|unable to find/i.test(msg)) {
    return 'Selector not found. Verify the locator in the Page Object matches current DOM. Use role or data-testid attributes for resilience.';
  }
  if (/net::ERR_CONNECTION|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
    return 'Network error. Ensure the target URL is reachable from the test runner. Check baseURL in playwright.config.ts.';
  }
  if (/404|not found/i.test(msg)) {
    return 'HTTP 404 returned. Verify the URL or route exists.';
  }
  if (/expect.*toBeVisible/i.test(msg)) {
    return 'Element visibility assertion failed. Use locator.waitFor() before asserting visibility.';
  }
  if (/expect.*toHaveURL/i.test(msg)) {
    return 'URL assertion failed. Add page.waitForURL() before asserting the URL.';
  }
  if (/assertion.*failed|expect.*received/i.test(msg)) {
    return 'Assertion mismatch. Review the expected vs received values and ensure test data in tests/data/ is up to date.';
  }

  return 'Test failed. Review the error stack, check the Playwright trace (trace.zip), and inspect screenshots in test-results/.';
}

// ── Reporter implementation ───────────────────────────────────────────────────

class AIReporter implements Reporter {
  private readonly outputPath: string;
  private readonly startTime: number;
  private readonly tests: AITestEntry[] = [];

  constructor(options: { outputDir?: string } = {}) {
    const dir = options.outputDir ?? 'test-results';
    this.outputPath = path.join(dir, 'ai-report.json');
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const errorInfo = result.error
      ? {
          message: result.error.message ?? '',
          stack: result.error.stack,
          location: result.error.location
            ? `${result.error.location.file}:${result.error.location.line}`
            : undefined,
        }
      : null;

    const entry: AITestEntry = {
      title: test.titlePath().join(' > '),
      file: test.location.file,
      project: test.parent?.project()?.name ?? '',
      status: result.status,
      durationMs: result.duration,
      retries: result.retry,
      error: errorInfo,
      aiHint: buildAIHint({ status: result.status, error: errorInfo }),
    };

    this.tests.push(entry);
  }

  onEnd(): void {
    const summary = {
      passed: this.tests.filter(t => t.status === 'passed').length,
      failed: this.tests.filter(t => t.status === 'failed').length,
      skipped: this.tests.filter(t => t.status === 'skipped').length,
      timedOut: this.tests.filter(t => t.status === 'timedOut').length,
      total: this.tests.length,
      durationMs: Date.now() - this.startTime,
    };

    const report: AIReport = {
      runId: new Date().toISOString(),
      summary,
      tests: this.tests,
    };

    try {
      const dir = path.dirname(this.outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2), 'utf8');
    } catch {
      // Non-fatal: reporter failure should never block CI
    }
  }
}

export default AIReporter;
