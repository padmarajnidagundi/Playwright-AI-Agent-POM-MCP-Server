import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeFailure } from '../../tools/platform/failure-analysis';
import { generateTestPreview } from '../../tools/platform/test-generator';
import { summarizeTraceArtifacts } from '../../tools/platform/trace-summary';
import {
  applyLocatorRepairWithApproval,
  buildLocatorRepairProposal,
  persistHealingRecord,
} from '../../tools/platform/healing';
import { buildDashboardMetrics } from '../../tools/platform/dashboard';
import { selectTestsForChanges } from '../../tools/platform/test-selection';
import { dispatch } from '../../mcp-server';

const repoRoot = path.resolve(__dirname, '..', '..');
const tmpRoot = path.join('/tmp', 'playwright-ai-agent-platform-tests');

test.beforeEach(() => {
  fs.mkdirSync(tmpRoot, { recursive: true });
});

test.afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('classifies locator failures with high confidence', async () => {
  const assessment = analyzeFailure("locator('.btn') not found", 'failed');
  expect(assessment.category).toBe('locator');
  expect(assessment.confidence).toBeGreaterThan(0.8);
});

test('generates natural-language test preview contract', async () => {
  const preview = generateTestPreview({
    prompt: 'Verify login error message for invalid credentials',
    targetPageObject: 'tests/pages/LoginPage.ts',
    targetSpec: 'tests/integration-tests/login.spec.ts',
    constraints: ['Use role selectors'],
  });

  expect(preview.pageObjectUpdates[0].file).toContain('LoginPage.ts');
  expect(preview.specScaffold.file).toContain('login.spec.ts');
  expect(preview.specScaffold.testCases.length).toBeGreaterThan(0);
});

test('handles missing trace artifacts gracefully', async () => {
  const summary = summarizeTraceArtifacts({
    tracePath: '/tmp/does-not-exist.trace.zip',
    errorMessage: 'Timeout 30000ms exceeded',
  });

  expect(summary.available).toBeFalsy();
  expect(summary.actionableSteps.length).toBeGreaterThan(0);
});

test('applies low-risk healing and persists record', async () => {
  const pageFile = path.join(tmpRoot, 'tests', 'pages', 'TempPage.ts');
  fs.mkdirSync(path.dirname(pageFile), { recursive: true });
  fs.writeFileSync(
    pageFile,
    "export class TempPage { button() { return this.page.locator('.old-btn'); } }",
    'utf8'
  );

  const proposal = buildLocatorRepairProposal({
    file: 'tests/pages/TempPage.ts',
    locatorName: 'button',
    currentSelector: '.old-btn',
    candidateSelectors: ['[data-testid="primary-button"]'],
    impactedSpecs: ['tests/wesendcv.spec.ts'],
  });

  const apply = applyLocatorRepairWithApproval({
    repoRoot: tmpRoot,
    proposal,
  });

  expect(apply.applied).toBeTruthy();
  expect(fs.readFileSync(pageFile, 'utf8')).toContain('[data-testid="primary-button"]');

  const record = persistHealingRecord({
    outputDir: path.join(tmpRoot, 'test-results', 'healing'),
    proposal,
    approval: { required: false },
    validation: { runCommand: 'npx playwright test tests/wesendcv.spec.ts', passed: true, output: 'ok' },
  });
  expect(record.schemaVersion).toBe('1.0.0');
});

test('blocks non-POM healing edits', async () => {
  const proposal = buildLocatorRepairProposal({
    file: 'tests/wesendcv.spec.ts',
    locatorName: 'bad',
    currentSelector: '.old',
    candidateSelectors: ['[data-testid="new"]'],
    impactedSpecs: ['tests/wesendcv.spec.ts'],
  });

  expect(() =>
    applyLocatorRepairWithApproval({
      repoRoot: tmpRoot,
      proposal,
    })
  ).toThrow(/Guardrail violation/);
});

test('builds dashboard metrics from historical reports', async () => {
  const historyDir = path.join(tmpRoot, 'test-results', 'history');
  fs.mkdirSync(historyDir, { recursive: true });
  fs.writeFileSync(
    path.join(historyDir, 'r1.json'),
    JSON.stringify({
      summary: { total: 4, failed: 1, durationMs: 1000 },
      tests: [{ status: 'failed', category: 'locator', retries: 1 }],
    }),
    'utf8'
  );

  const metrics = buildDashboardMetrics(historyDir);
  expect(metrics.runs).toBe(1);
  expect(metrics.totalFailures).toBe(1);
  expect(metrics.topFailureCategories[0].category).toBe('locator');
});

test('selects impacted specs from changed files', async () => {
  const selection = selectTestsForChanges({
    repoRoot,
    changedFiles: ['tools/platform/failure-analysis.ts'],
  });

  expect(selection.selectedSpecs.some(spec => spec.includes('unit-tests'))).toBeTruthy();
});

test('MCP contract exposes new tool list', async () => {
  const response = await dispatch({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
  });

  const tools = ((response.result as { tools: Array<{ name: string }> }).tools ?? []).map(t => t.name);
  expect(tools).toContain('analyze_failures');
  expect(tools).toContain('generate_test_preview');
  expect(tools).toContain('select_tests_for_changes');
});

test('MCP returns method-not-found for unknown method', async () => {
  const response = await dispatch({
    jsonrpc: '2.0',
    id: 2,
    method: 'unknown/method',
  });

  expect(response.error?.code).toBe(-32601);
});

test('MCP failure-injection handles missing AI report', async () => {
  const reportPath = path.join(repoRoot, 'test-results', 'ai-report.json');
  const backup = path.join(tmpRoot, 'backup-ai-report.json');

  if (fs.existsSync(reportPath)) {
    fs.copyFileSync(reportPath, backup);
    fs.rmSync(reportPath, { force: true });
  }

  try {
    const response = await dispatch({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'analyze_failures',
        arguments: {},
      },
    });

    expect(response.error?.code).toBe(-32603);
    expect(response.error?.message).toContain('No AI report found');
  } finally {
    if (fs.existsSync(backup)) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.copyFileSync(backup, reportPath);
      fs.rmSync(backup, { force: true });
    }
  }
});
