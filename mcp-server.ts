#!/usr/bin/env node

import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { analyzeFailure } from './tools/platform/failure-analysis';
import { summarizeTraceArtifacts } from './tools/platform/trace-summary';
import { generateTestPreview } from './tools/platform/test-generator';
import {
  applyLocatorRepairWithApproval,
  buildLocatorRepairProposal,
  persistHealingRecord,
  runValidationRerun,
} from './tools/platform/healing';
import { buildDashboardMetrics } from './tools/platform/dashboard';
import { selectTestsForChanges } from './tools/platform/test-selection';
import { redactSecrets, sanitizeEnv } from './tools/platform/secret-redaction';
import { readFeatureFlags } from './tools/platform/feature-flags';
import { runInParallel } from './tools/platform/parallel-executor';
import { writeAnalyticsEvent } from './tools/platform/analytics';

type JsonObject = Record<string, unknown>;

interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: JsonObject;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

const REPO_ROOT = path.resolve(__dirname);
const REPORT_PATH = path.join(REPO_ROOT, 'test-results', 'ai-report.json');
const HEALING_DIR = path.join(REPO_ROOT, 'test-results', 'healing');
const ANALYTICS_DIR = path.join(REPO_ROOT, 'test-results', 'analytics');
const HISTORY_DIR = path.join(REPO_ROOT, 'test-results', 'history');

const KNOWN_PROJECTS = new Set([
  'chromium', 'firefox', 'webkit', 'Mobile Chrome', 'Mobile Safari',
]);
const SAFE_PATH_RE = /^[\w./-]+$/;

const TOOLS = [
  {
    name: 'run_tests',
    description: 'Run Playwright tests with optional filter/project and optional shard list for parallel deterministic execution.',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string' },
        project: { type: 'string' },
        shards: { type: 'array', items: { type: 'string' } },
      },
    },
  },
  {
    name: 'get_test_results',
    description: 'Read test-results/ai-report.json with normalized failure analysis and artifact links.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_test_files',
    description: 'List all spec files under tests/.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'analyze_failures',
    description: 'Summarize failures by category and probable root causes from AI report.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_trace_summary',
    description: 'Return trace summary for all failed tests or a specific test title.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string' } },
    },
  },
  {
    name: 'generate_test_preview',
    description: 'Generate natural-language test preview with POM update contract.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        targetPageObject: { type: 'string' },
        targetSpec: { type: 'string' },
        constraints: { type: 'array', items: { type: 'string' } },
      },
      required: ['prompt', 'targetPageObject', 'targetSpec'],
    },
  },
  {
    name: 'propose_locator_repair',
    description: 'Generate locator repair proposal with confidence and blast radius.',
    inputSchema: {
      type: 'object',
      properties: {
        file: { type: 'string' },
        locatorName: { type: 'string' },
        currentSelector: { type: 'string' },
        candidateSelectors: { type: 'array', items: { type: 'string' } },
        impactedSpecs: { type: 'array', items: { type: 'string' } },
      },
      required: ['file', 'locatorName', 'currentSelector', 'candidateSelectors'],
    },
  },
  {
    name: 'apply_locator_repair',
    description: 'Apply approved locator proposal with guardrails and persist healing record.',
    inputSchema: {
      type: 'object',
      properties: {
        proposal: { type: 'object' },
        approvedBy: { type: 'string' },
      },
      required: ['proposal'],
    },
  },
  {
    name: 'validate_healing_rerun',
    description: 'Run validation rerun for impacted specs only and return comparison signal.',
    inputSchema: {
      type: 'object',
      properties: {
        impactedSpecs: { type: 'array', items: { type: 'string' } },
        project: { type: 'string' },
      },
    },
  },
  {
    name: 'get_dashboard_metrics',
    description: 'Build dashboard-ready historical QA metrics from archived reports.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'select_tests_for_changes',
    description: 'Select impacted tests from changed file paths with explainable reasons.',
    inputSchema: {
      type: 'object',
      properties: { changedFiles: { type: 'array', items: { type: 'string' } } },
      required: ['changedFiles'],
    },
  },
];

function sanitizePath(value: string, allowOutsideTests = false): string {
  if (!SAFE_PATH_RE.test(value)) {
    throw new Error(`Invalid path value: "${value}".`);
  }
  const normalized = value.replace(/\\/g, '/');
  if (!allowOutsideTests && !normalized.startsWith('tests/')) {
    throw new Error(`Path must be within tests/: ${value}`);
  }
  return normalized;
}

function sanitizeProject(value: string): string {
  if (!KNOWN_PROJECTS.has(value)) {
    throw new Error(`Unknown project: "${value}".`);
  }
  return value;
}

function parseArrayStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === 'string');
}

function listSpecFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listSpecFiles(full));
    else if (/\.spec\.(ts|js)$/.test(entry.name)) files.push(path.relative(REPO_ROOT, full).replace(/\\/g, '/'));
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function assertToolAuthorized(name: string): void {
  const raw = process.env.MCP_ALLOWED_TOOLS;
  if (!raw || raw.trim() === '') return;
  const allow = new Set(raw.split(',').map(x => x.trim()).filter(Boolean));
  if (!allow.has(name)) {
    throw new Error(`Tool not authorized by policy: ${name}`);
  }
}

function readAiReport(): JsonObject {
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error('No AI report found. Run tests first using run_tests.');
  }
  return JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) as JsonObject;
}

function handleRunTests(params: JsonObject): unknown {
  const rawFilter = typeof params.filter === 'string' ? params.filter : '';
  const rawProject = typeof params.project === 'string' ? params.project : '';
  const shards = parseArrayStrings(params.shards).map(s => sanitizePath(s));

  const filter = rawFilter ? sanitizePath(rawFilter) : '';
  const project = rawProject ? sanitizeProject(rawProject) : '';

  const runOne = async (target: string): Promise<string> => {
    const args = ['playwright', 'test'];
    if (target) args.push(target);
    if (project) args.push('--project', project);
    args.push('--reporter=list');

    return execFileSync('npx', args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 300_000,
      env: sanitizeEnv(process.env),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  };

  if (shards.length > 0) {
    return runInParallel(shards, async shard => redactSecrets(await runOne(shard)));
  }

  return redactSecrets(execFileSync('npx', [
    'playwright',
    'test',
    ...(filter ? [filter] : []),
    ...(project ? ['--project', project] : []),
    '--reporter=list',
  ], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 300_000,
    env: sanitizeEnv(process.env),
    stdio: ['pipe', 'pipe', 'pipe'],
  }));
}

function handleGetTestResults(): unknown {
  return readAiReport();
}

function handleAnalyzeFailures(): unknown {
  const report = readAiReport();
  const tests = Array.isArray(report.tests) ? (report.tests as JsonObject[]) : [];
  const failed = tests.filter(t => {
    const status = typeof t.status === 'string' ? t.status : '';
    return status === 'failed' || status === 'timedOut';
  });

  const byCategory = new Map<string, number>();
  const details = failed.map(t => {
    const errorMessage = ((t.error as JsonObject | undefined)?.message as string | undefined) ?? '';
    const status = (t.status as string | undefined) ?? 'failed';
    const assessment = analyzeFailure(errorMessage, status);
    byCategory.set(assessment.category, (byCategory.get(assessment.category) ?? 0) + 1);
    return {
      title: t.title,
      file: t.file,
      category: assessment.category,
      probableCause: assessment.probableCause,
      confidence: assessment.confidence,
    };
  });

  return {
    failures: failed.length,
    categories: [...byCategory.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    details,
  };
}

function handleGetTraceSummary(params: JsonObject): unknown {
  const title = typeof params.title === 'string' ? params.title : '';
  const report = readAiReport();
  const tests = Array.isArray(report.tests) ? (report.tests as JsonObject[]) : [];

  const targets = tests.filter(t => {
    const status = typeof t.status === 'string' ? t.status : '';
    const testTitle = typeof t.title === 'string' ? t.title : '';
    if (title) return testTitle === title;
    return status === 'failed' || status === 'timedOut';
  });

  return targets.map(t => {
    const artifacts = (t.artifacts as JsonObject | undefined) ?? {};
    const errorInfo = (t.error as JsonObject | undefined) ?? {};
    const summary = summarizeTraceArtifacts({
      tracePath: typeof artifacts.trace === 'string' ? artifacts.trace : undefined,
      screenshotPath: typeof artifacts.screenshot === 'string' ? artifacts.screenshot : undefined,
      videoPath: typeof artifacts.video === 'string' ? artifacts.video : undefined,
      errorMessage: typeof errorInfo.message === 'string' ? errorInfo.message : undefined,
    });

    return {
      title: t.title,
      file: t.file,
      traceSummary: summary,
    };
  });
}

function handleGenerateTestPreview(params: JsonObject): unknown {
  if (typeof params.prompt !== 'string' || typeof params.targetPageObject !== 'string' || typeof params.targetSpec !== 'string') {
    throw new Error('prompt, targetPageObject, and targetSpec are required strings.');
  }

  const request = {
    prompt: params.prompt,
    targetPageObject: sanitizePath(params.targetPageObject, true),
    targetSpec: sanitizePath(params.targetSpec, true),
    constraints: parseArrayStrings(params.constraints),
  };

  return generateTestPreview(request);
}

function handleProposeLocatorRepair(params: JsonObject): unknown {
  const file = typeof params.file === 'string' ? sanitizePath(params.file, true) : '';
  const locatorName = typeof params.locatorName === 'string' ? params.locatorName : '';
  const currentSelector = typeof params.currentSelector === 'string' ? params.currentSelector : '';
  const candidateSelectors = parseArrayStrings(params.candidateSelectors);
  const impactedSpecs = parseArrayStrings(params.impactedSpecs).map(spec => sanitizePath(spec));

  if (!file || !locatorName || !currentSelector || candidateSelectors.length === 0) {
    throw new Error('file, locatorName, currentSelector and candidateSelectors are required.');
  }

  const proposal = buildLocatorRepairProposal({
    file,
    locatorName,
    currentSelector,
    candidateSelectors,
    impactedSpecs,
  });

  writeAnalyticsEvent({
    outputDir: ANALYTICS_DIR,
    eventType: 'healing.proposed',
    metadata: { proposalId: proposal.id, file, risk: proposal.risk },
  });

  return proposal;
}

function handleApplyLocatorRepair(params: JsonObject): unknown {
  const proposal = params.proposal as JsonObject | undefined;
  if (!proposal) throw new Error('proposal is required.');

  const approvedBy = typeof params.approvedBy === 'string' ? params.approvedBy : undefined;
  const apply = applyLocatorRepairWithApproval({
    repoRoot: REPO_ROOT,
    proposal: proposal as unknown as ReturnType<typeof buildLocatorRepairProposal>,
    approvedBy,
  });

  const impactedSpecs = Array.isArray((proposal as JsonObject).blastRadius)
    ? []
    : (((proposal as JsonObject).blastRadius as JsonObject | undefined)?.impactedSpecs as string[] | undefined) ?? [];
  const validation = runValidationRerun({ cwd: REPO_ROOT, impactedSpecs });

  const approvalRequired = (proposal.risk as string | undefined) !== 'low';
  const record = persistHealingRecord({
    outputDir: HEALING_DIR,
    proposal: proposal as unknown as ReturnType<typeof buildLocatorRepairProposal>,
    approval: {
      required: approvalRequired,
      approvedBy,
      approvedAt: approvedBy ? new Date().toISOString() : undefined,
    },
    validation: {
      runCommand: validation.command,
      passed: validation.passed,
      output: validation.output,
    },
  });

  writeAnalyticsEvent({
    outputDir: ANALYTICS_DIR,
    eventType: apply.applied ? 'healing.approved' : 'healing.rejected',
    metadata: { proposalId: record.proposal.id, reason: apply.reason },
  });

  return {
    apply,
    validation,
    record,
  };
}

function handleValidateHealingRerun(params: JsonObject): unknown {
  const impactedSpecs = parseArrayStrings(params.impactedSpecs).map(spec => sanitizePath(spec));
  const project = typeof params.project === 'string' ? sanitizeProject(params.project) : undefined;
  return runValidationRerun({ cwd: REPO_ROOT, impactedSpecs, project });
}

function handleDashboardMetrics(): unknown {
  return buildDashboardMetrics(HISTORY_DIR);
}

function handleSelectTestsForChanges(params: JsonObject): unknown {
  const changedFiles = parseArrayStrings(params.changedFiles).map(file => sanitizePath(file, true));
  if (changedFiles.length === 0) throw new Error('changedFiles must include at least one file.');
  return selectTestsForChanges({ repoRoot: REPO_ROOT, changedFiles });
}

export async function dispatch(req: MCPRequest): Promise<MCPResponse> {
  if (req.method === 'tools/list') {
    return { jsonrpc: '2.0', id: req.id, result: { tools: TOOLS } };
  }

  if (req.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'playwright-ai-agent-mcp', version: '2.0.0' },
      },
    };
  }

  if (req.method === 'notifications/initialized') {
    return { jsonrpc: '2.0', id: req.id, result: {} };
  }

  if (req.method === 'tools/call') {
    const { name, arguments: args = {} } = req.params as {
      name: string;
      arguments?: JsonObject;
    };

    try {
      assertToolAuthorized(name);
      const flags = readFeatureFlags(process.env);
      let result: unknown;

      if (name === 'run_tests') result = await handleRunTests(args);
      else if (name === 'get_test_results') result = handleGetTestResults();
      else if (name === 'list_test_files') result = listSpecFiles(path.join(REPO_ROOT, 'tests'));
      else if (name === 'analyze_failures') {
        if (!flags.analysisEnabled) throw new Error('analysis feature is disabled by flag.');
        result = handleAnalyzeFailures();
      } else if (name === 'get_trace_summary') {
        if (!flags.analysisEnabled) throw new Error('analysis feature is disabled by flag.');
        result = handleGetTraceSummary(args);
      } else if (name === 'generate_test_preview') result = handleGenerateTestPreview(args);
      else if (name === 'propose_locator_repair') {
        if (!flags.healingEnabled) throw new Error('healing feature is disabled by flag.');
        result = handleProposeLocatorRepair(args);
      } else if (name === 'apply_locator_repair') {
        if (!flags.healingEnabled) throw new Error('healing feature is disabled by flag.');
        result = handleApplyLocatorRepair(args);
      } else if (name === 'validate_healing_rerun') {
        if (!flags.healingEnabled) throw new Error('healing feature is disabled by flag.');
        result = handleValidateHealingRerun(args);
      } else if (name === 'get_dashboard_metrics') {
        if (!flags.dashboardEnabled) throw new Error('dashboard feature is disabled by flag.');
        result = handleDashboardMetrics();
      } else if (name === 'select_tests_for_changes') {
        if (!flags.testSelectionEnabled) throw new Error('test selection feature is disabled by flag.');
        result = handleSelectTestsForChanges(args);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }

      return {
        jsonrpc: '2.0',
        id: req.id,
        result: { content: [{ type: 'text', text: redactSecrets(JSON.stringify(result, null, 2)) }] },
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id: req.id,
        error: { code: -32603, message: redactSecrets((err as Error).message) },
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id: req.id,
    error: { code: -32601, message: `Method not found: ${req.method}` },
  };
}

export function startStdioServer(): void {
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const req: MCPRequest = JSON.parse(trimmed);
      const response = await dispatch(req);
      process.stdout.write(JSON.stringify(response) + '\n');
    } catch {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' },
        }) + '\n'
      );
    }
  });
}

if (require.main === module) {
  startStdioServer();
}
