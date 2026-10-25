/**
 * ai-reporter.ts — Custom Playwright reporter that writes a structured JSON
 * file consumed by LLM agents, MCP tools, and chatmode prompts.
 *
 * Output: test-results/ai-report.json
 */

import type {
  Reporter,
  TestCase,
  TestResult,
  TestError,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { AI_REPORT_SCHEMA_VERSION } from './platform/schemas';
import { analyzeFailure } from './platform/failure-analysis';
import { summarizeTraceArtifacts } from './platform/trace-summary';
import { redactSecrets } from './platform/secret-redaction';
import { archiveReportIfExists } from './platform/report-history';

interface AITestEntry {
  title: string;
  file: string;
  project: string;
  status: TestResult['status'];
  durationMs: number;
  retries: number;
  error: { message: string; stack?: string; location?: string } | null;
  aiHint: string | null;
  category: string;
  rootCause: { probableCause: string; confidence: number } | null;
  artifacts: {
    trace?: string;
    screenshot?: string;
    video?: string;
    log?: string;
  };
  traceSummary: {
    available: boolean;
    summary: string;
    actionableSteps: string[];
    evidence: string[];
  };
}

interface AIReport {
  schemaVersion: string;
  runId: string;
  generatedAt: string;
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

function toErrorInfo(error: TestError | undefined): {
  message: string;
  stack?: string;
  location?: string;
} | null {
  if (!error) return null;
  return {
    message: redactSecrets(error.message ?? ''),
    stack: error.stack ? redactSecrets(error.stack) : undefined,
    location: error.location
      ? `${error.location.file}:${error.location.line}`
      : undefined,
  };
}

function buildAIHint(entry: Pick<AITestEntry, 'status' | 'error' | 'category'>): string | null {
  if (entry.status === 'passed' || entry.status === 'skipped') return null;

  const msg = entry.error?.message ?? '';

  if (entry.status === 'timedOut') {
    return 'Test timed out. Consider increasing the timeout, checking for slow selectors, or adding explicit waits.';
  }
  if (entry.category === 'locator') {
    return 'Selector not found. Verify the locator in the Page Object matches current DOM. Use role or data-testid attributes for resilience.';
  }
  if (entry.category === 'network') {
    return 'Network error. Ensure the target URL is reachable from the test runner. Check baseURL in playwright.config.ts.';
  }
  if (/expect.*toBeVisible/i.test(msg)) {
    return 'Element visibility assertion failed. Use locator.waitFor() before asserting visibility.';
  }
  if (/expect.*toHaveURL/i.test(msg)) {
    return 'URL assertion failed. Add page.waitForURL() before asserting the URL.';
  }

  return 'Test failed. Review the error stack, check the Playwright trace (trace.zip), and inspect screenshots in test-results/.';
}

function collectArtifacts(result: TestResult): {
  trace?: string;
  screenshot?: string;
  video?: string;
  log?: string;
} {
  const artifacts: {
    trace?: string;
    screenshot?: string;
    video?: string;
    log?: string;
  } = {};

  for (const attachment of result.attachments ?? []) {
    const name = (attachment.name ?? '').toLowerCase();
    const filePath = attachment.path;
    if (!filePath) continue;

    if (name.includes('trace') || filePath.endsWith('.zip')) artifacts.trace = filePath;
    else if (name.includes('screenshot') || filePath.endsWith('.png')) artifacts.screenshot = filePath;
    else if (name.includes('video') || filePath.endsWith('.webm')) artifacts.video = filePath;
    else if (name.includes('log') || filePath.endsWith('.log')) artifacts.log = filePath;
  }

  return artifacts;
}

class AIReporter implements Reporter {
  private readonly outputPath: string;
  private readonly historyPath: string;
  private readonly startTime: number;
  private readonly tests: AITestEntry[] = [];

  constructor(options: { outputDir?: string } = {}) {
    const dir = options.outputDir ?? 'test-results';
    this.outputPath = path.join(dir, 'ai-report.json');
    this.historyPath = path.join(dir, 'history');
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const errorInfo = toErrorInfo(result.error);
    const artifacts = collectArtifacts(result);
    const assessment = analyzeFailure(errorInfo?.message ?? '', result.status);
    const traceSummary = summarizeTraceArtifacts({
      tracePath: artifacts.trace,
      screenshotPath: artifacts.screenshot,
      videoPath: artifacts.video,
      errorMessage: errorInfo?.message,
    });

    const entry: AITestEntry = {
      title: test.titlePath().join(' > '),
      file: test.location.file,
      project: test.parent?.project()?.name ?? '',
      status: result.status,
      durationMs: result.duration,
      retries: result.retry,
      error: errorInfo,
      category: assessment.category,
      rootCause: result.status === 'passed' || result.status === 'skipped'
        ? null
        : { probableCause: assessment.probableCause, confidence: assessment.confidence },
      artifacts,
      traceSummary,
      aiHint: null,
    };

    entry.aiHint = buildAIHint(entry);
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
      schemaVersion: AI_REPORT_SCHEMA_VERSION,
      runId: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      summary,
      tests: this.tests,
    };

    try {
      const dir = path.dirname(this.outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      archiveReportIfExists(this.outputPath, this.historyPath);
      fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2), 'utf8');
    } catch {
      // Non-fatal: reporter failure should never block CI
    }
  }
}

export default AIReporter;
