#!/usr/bin/env node
/**
 * mcp-server.ts — Lightweight MCP (Model Context Protocol) server for
 * Playwright AI Agent POM.
 *
 * Exposes three tools over stdio JSON-RPC so that any MCP-compatible LLM
 * client (GitHub Copilot, Claude, etc.) can:
 *   1. `run_tests`        — Execute the Playwright test suite (or a subset)
 *   2. `get_test_results` — Read the last AI report from test-results/ai-report.json
 *   3. `list_test_files`  — List all spec files in the tests/ directory
 *
 * Usage:
 *   npx ts-node mcp-server.ts
 *   # or add to .vscode/mcp.json as a custom server entry
 *
 * Protocol: https://modelcontextprotocol.io/
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ── Types ────────────────────────────────────────────────────────────────────

interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}

// ── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'run_tests',
    description:
      'Run the Playwright test suite. Optionally pass a `filter` string to run a specific file or folder (e.g. "tests/unit-tests/" or "tests/wesendcv.spec.ts").',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          description: 'Optional file path or glob to restrict which tests run.',
        },
        project: {
          type: 'string',
          description: 'Optional Playwright project name (e.g. "chromium", "firefox").',
        },
      },
    },
  },
  {
    name: 'get_test_results',
    description:
      'Return the last AI test report (test-results/ai-report.json). Includes pass/fail summary, per-test status, error messages, and AI-generated fix hints.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_test_files',
    description: 'List all Playwright spec files found under the tests/ directory.',
    inputSchema: { type: 'object', properties: {} },
  },
];

// ── Tool handlers ─────────────────────────────────────────────────────────────

function handleRunTests(params: Record<string, unknown>): string {
  const filter = typeof params.filter === 'string' ? params.filter : '';
  const project = typeof params.project === 'string' ? `--project="${params.project}"` : '';
  const cmd = `npx playwright test ${filter} ${project} --reporter=list`.trim();
  try {
    const output = execSync(cmd, {
      cwd: path.resolve(__dirname, '..'),
      encoding: 'utf8',
      timeout: 300_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output;
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return (e.stdout ?? '') + '\n' + (e.stderr ?? '') + '\n' + (e.message ?? '');
  }
}

function handleGetTestResults(): unknown {
  const reportPath = path.resolve(__dirname, '..', 'test-results', 'ai-report.json');
  if (!fs.existsSync(reportPath)) {
    return { error: 'No AI report found. Run tests first using the run_tests tool.' };
  }
  return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
}

function listSpecFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSpecFiles(full));
    } else if (/\.spec\.(ts|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function handleListTestFiles(): string[] {
  const testsDir = path.resolve(__dirname, '..', 'tests');
  return listSpecFiles(testsDir);
}

// ── JSON-RPC dispatcher ───────────────────────────────────────────────────────

function dispatch(req: MCPRequest): MCPResponse {
  if (req.method === 'tools/list') {
    return { jsonrpc: '2.0', id: req.id, result: { tools: TOOLS } };
  }

  if (req.method === 'tools/call') {
    const { name, arguments: args = {} } = req.params as {
      name: string;
      arguments?: Record<string, unknown>;
    };

    try {
      let result: unknown;
      if (name === 'run_tests') result = handleRunTests(args);
      else if (name === 'get_test_results') result = handleGetTestResults();
      else if (name === 'list_test_files') result = handleListTestFiles();
      else throw new Error(`Unknown tool: ${name}`);

      return {
        jsonrpc: '2.0',
        id: req.id,
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id: req.id,
        error: { code: -32603, message: (err as Error).message },
      };
    }
  }

  // initialize handshake
  if (req.method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'playwright-ai-agent-mcp', version: '1.0.0' },
      },
    };
  }

  if (req.method === 'notifications/initialized') {
    return { jsonrpc: '2.0', id: req.id, result: {} };
  }

  return {
    jsonrpc: '2.0',
    id: req.id,
    error: { code: -32601, message: `Method not found: ${req.method}` },
  };
}

// ── Main stdio loop ───────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const req: MCPRequest = JSON.parse(trimmed);
    const response = dispatch(req);
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
