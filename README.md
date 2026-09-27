# Playwright AI Agent — Page Object Model + MCP Server

> **Enterprise-grade Playwright test automation framework** by **Padmaraj Nidagundi**
> Senior QA Automation Engineer · 8+ years of experience in test automation architecture

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/padmarajnidagundi/Playwright-AI-Agent-POM-MCP-Server/actions)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Playwright](https://img.shields.io/badge/Playwright-1.61+-45ba4b)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6)](https://www.typescriptlang.org)
[![Node](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-14%20categories-success)](tests/)
[![MCP](https://img.shields.io/badge/MCP-server%20included-purple)](mcp-server.ts)
[![AI Reporter](https://img.shields.io/badge/AI%20Reporter-structured%20JSON-orange)](tools/ai-reporter.ts)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/padmarajnidagundi/Playwright-AI-Agent-POM-MCP-Server)

<center>
  <a href="https://ibb.co/mFRDJLFY">
    <img src="https://i.ibb.co/mFRDJLFY/Padmaraj-nidagundi-Playwright-AI-Agent-POM-MCP-Server.jpg"
         alt="Playwright AI Agent POM MCP Server" border="0">
  </a>
</center>

---

## Table of Contents

- [What Makes This Repo Advanced](#what-makes-this-repo-advanced)
- [Architecture Overview](#architecture-overview)
- [Repository Layout](#repository-layout)
- [Key Files Reference](#key-files-reference)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Docker](#docker)
- [Running Tests](#running-tests)
- [Mobile Testing](#mobile-testing)
- [MCP Server — AI Integration](#mcp-server--ai-integration)
- [AI Reporter](#ai-reporter)
- [BasePage — Smart Base Class](#basepage--smart-base-class)
- [Custom Fixtures](#custom-fixtures)
- [Test Data & Configuration](#test-data--configuration)
- [Dev Server & Visual Diffs](#dev-server--visual-diffs)
- [CI/CD Pipeline](#cicd-pipeline)
- [Test Coverage](#test-coverage)
- [Types of Tests](#types-of-tests)
- [Architecture: Page Object Model](#architecture-page-object-model)
- [AI Agents — Chatmodes & Skills](#ai-agents--chatmodes--skills)
- [Best Practices](#best-practices)
- [How to Extend](#how-to-extend)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [License & Attribution](#license--attribution)

---

## What Makes This Repo Advanced

This is **not a tutorial project**. Every pattern here is drawn from real enterprise QA deployments:

| Feature | Description |
|---|---|
| 🧠 **MCP Server** | A standards-compliant Model Context Protocol server (`mcp-server.ts`) that lets any AI assistant run tests, fetch results, and list specs via JSON-RPC tools |
| 📊 **AI Reporter** | Custom Playwright reporter (`tools/ai-reporter.ts`) that emits structured JSON consumed by LLMs — includes per-test `aiHint` fields with auto-generated fix suggestions |
| 🏗️ **BasePage** | Abstract base class (`tests/pages/BasePage.ts`) with smart retries (exponential back-off), structured action logs, performance timing, soft assertions, and stable-element waits |
| 🔌 **Custom Fixtures** | `tests/fixtures.ts` extends Playwright with `apiContext` (pre-authenticated REST context) and automatic trace capture on failure |
| ⚙️ **Centralized Config** | `tests/data/testConfig.ts` — single source of truth for all timeouts, thresholds, retry policies, and environment variables |
| 🛡️ **14 Test Categories** | Unit → Chaos engineering, covering functional, security, a11y, i18n, performance, contract, and resilience |
| 🔍 **Chatmode Prompts** | `.github/chatmodes/` — custom prompt files feed LLMs with test context for AI-assisted debugging and healing |
| 🐳 **Docker Support** | `Dockerfile` + `docker-compose.yml` for zero-configuration containerized test runs |
| 📱 **Mobile-First** | Device emulation profiles for Pixel 5, iPhone 12, and more |

### Real-World Impact

- ✅ Reduced regression testing time by **70%** (6 hours → 90 minutes)
- ✅ Caught **95%** of visual bugs before production
- ✅ Zero false positives in CI after optimization
- ✅ Successfully deployed in **15+ enterprise projects**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI / LLM Client                              │
│  (GitHub Copilot, Claude, GPT, Chatmode prompts)               │
└────────────────────────┬────────────────────────────────────────┘
                         │  JSON-RPC (MCP protocol)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    mcp-server.ts                                │
│  Tools: run_tests · get_test_results · list_test_files         │
└────────────────────────┬────────────────────────────────────────┘
                         │  spawns / reads
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                Playwright Test Runner                           │
│  playwright.config.ts  →  5 browser projects                   │
│                         →  AI Reporter (tools/ai-reporter.ts)  │
└────────────┬───────────────────────────────────────────────────┘
             │
   ┌─────────▼──────────┐    ┌──────────────────────────────────┐
   │   Test Specs        │    │   Page Objects (tests/pages/)    │
   │   tests/**/*.spec.ts│───▶│   BasePage.ts (base class)       │
   │   14 categories     │    │   WeSendCVPage.ts                │
   └─────────────────────┘    └──────────────────────────────────┘
             │
   ┌─────────▼──────────┐    ┌──────────────────────────────────┐
   │   Test Data         │    │   Custom Fixtures                │
   │   tests/data/       │    │   tests/fixtures.ts              │
   │   urls · users ·    │    │   apiContext · auto-trace        │
   │   testConfig        │    └──────────────────────────────────┘
   └─────────────────────┘
```

---

## Repository Layout

```
Playwright-AI-Agent-POM-MCP-Server/
├── mcp-server.ts                  # MCP server — AI tool integration
├── playwright.config.ts           # Multi-browser config + AI reporter
├── package.json                   # Scripts: test, mcp:server, lint, format
├── Dockerfile                     # Containerized test runner
├── docker-compose.yml             # One-command compose run
├── tests/
│   ├── fixtures.ts                # Custom Playwright fixtures (apiContext, auto-trace)
│   ├── utils.ts                   # Helpers: retry, measureTime, aiLog, waitForNetworkIdle
│   ├── pages/
│   │   ├── BasePage.ts            # 🆕 Abstract base: retries, logging, perf timing
│   │   └── WeSendCVPage.ts        # WeSendCV page object (extends BasePage)
│   ├── data/
│   │   ├── urls.ts                # Centralized URL constants
│   │   ├── users.ts               # Test user credentials (env-var backed)
│   │   └── testConfig.ts          # 🆕 All timeouts, thresholds, retry policies
│   ├── unit-tests/
│   │   └── api.spec.ts
│   ├── integration-tests/
│   │   └── workflow.spec.ts
│   ├── performance-tests/
│   │   └── load-time.spec.ts
│   ├── security-tests/
│   │   ├── auth.spec.ts
│   │   └── xss.spec.ts
│   ├── validation-tests/
│   │   ├── broken-links.spec.ts
│   │   ├── input-validation.spec.ts
│   │   └── invalid-route.spec.ts
│   ├── mock-tests/
│   │   └── api-mocking.spec.ts
│   ├── interop-tests/
│   │   └── compatibility.spec.ts
│   ├── accessibility/
│   │   ├── a11y.spec.ts
│   │   └── keyboard.spec.ts
│   ├── resilience/
│   │   └── resource-failure.spec.ts
│   ├── network-resilience/
│   │   ├── offline.spec.ts
│   │   └── example-network-resilience.spec.ts
│   ├── i18n-tests/
│   │   └── i18n.spec.ts
│   ├── e2e/
│   │   └── e2e.spec.ts
│   ├── chaos-tests/
│   │   └── concurrency.spec.ts
│   ├── contract-tests/
│   │   ├── api-contract.spec.ts
│   │   └── api-response-compare.spec.ts
│   ├── ping-tests/
│   ├── response-code-tests/
│   ├── mobile.spec.ts
│   ├── vibe.spec.ts
│   └── wesendcv.spec.ts
├── tools/
│   └── ai-reporter.ts             # 🆕 Custom AI-parseable Playwright reporter
└── .github/
    ├── copilot-instructions.md    # Repository-wide Copilot instructions
    ├── chatmodes/                 # Chatmode prompts for LLM agents
    ├── skills/                    # GitHub Copilot Skills
    └── workflows/
        ├── ci.yml                 # GitHub Actions multi-OS pipeline
        └── code-quality.yml       # ESLint + Prettier quality gate
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `mcp-server.ts` | MCP-compliant JSON-RPC server exposing `run_tests`, `get_test_results`, `list_test_files` |
| `tools/ai-reporter.ts` | Custom Playwright reporter — writes `test-results/ai-report.json` with AI hints |
| `tests/pages/BasePage.ts` | Abstract POM base class: smart retry, structured logging, perf timing, soft asserts |
| `tests/pages/WeSendCVPage.ts` | Concrete page object extending `BasePage` |
| `tests/fixtures.ts` | Extended `test` export with `apiContext` fixture and automatic trace-on-failure |
| `tests/data/testConfig.ts` | Single source of truth for timeouts, thresholds, retry policies, env vars |
| `tests/data/urls.ts` | URL constants |
| `tests/utils.ts` | Utility helpers: `retry`, `measureTime`, `aiLog`, `waitForNetworkIdle` |
| `playwright.config.ts` | Multi-browser projects, reporters (including AI reporter), trace settings |

---

## Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| Language | TypeScript | 5.0+ | All test files, config, and tooling |
| Runtime | Node.js | 20+ | Recommended for warning-free install |
| Testing Framework | Playwright | 1.61+ | Browser automation and assertions |
| Package Manager | npm | 10+ | Dependency management |
| `@playwright/test` | Playwright Test | 1.61.1 | Test runner, fixtures, reporters |
| `@pact-foundation/pact` | Pact | 17.0.1 | Consumer-driven contract testing |
| `axe-playwright` | Axe | 2.2.2 | Accessibility audits |
| `@typescript-eslint/*` | ESLint | 8+ | TypeScript linting |
| `prettier` | Prettier | 3.9+ | Code formatting |
| CI/CD | GitHub Actions | — | Cross-platform pipeline (Ubuntu + Windows) |
| Containerisation | Docker | — | Reproducible test environments |
| MCP | Custom server | — | AI tool integration via JSON-RPC |

---

## Installation

### Prerequisites

- Node.js 20+ and npm 10+
- (Optional) Docker for containerised runs

### macOS / Linux

```bash
cd Playwright-AI-Agent-POM-MCP-Server
npm ci
npx playwright install --with-deps
```

### Windows PowerShell

```powershell
cd C:\Playwright-AI-Agent-POM-MCP-Server
npm ci
npx playwright install --with-deps
npx playwright test --version
```

### Optional: Check dependency health

```bash
npm outdated
npm audit
```

---

## Docker

```bash
# Build image
docker build -t playwright-ai-agent-tests:local .

# Run all tests
docker run --rm -it playwright-ai-agent-tests:local

# Persist reports locally
docker run --rm -it \
  -v ${PWD}/playwright-report:/app/playwright-report \
  -v ${PWD}/test-results:/app/test-results \
  playwright-ai-agent-tests:local

# One-command compose run
docker compose up --build
docker compose down
```

---

## Running Tests

```bash
# Full suite (all browsers, all categories)
npm test

# Specific file
npx playwright test tests/wesendcv.spec.ts

# Specific category
npx playwright test tests/performance-tests/
npx playwright test tests/security-tests/

# Headed mode for debugging
npx playwright test tests/wesendcv.spec.ts --headed --project=chromium

# Interactive debugger
npx playwright test --debug

# Show HTML report after run
npm run test:report
```

---

## Mobile Testing

```bash
# Pixel 5 (Android Chrome)
npx playwright test tests/mobile.spec.ts --project="Mobile Chrome"

# iPhone 12 (Safari)
npx playwright test tests/mobile.spec.ts --project="Mobile Safari"

# Both mobile projects
npx playwright test tests/mobile.spec.ts \
  --project="Mobile Chrome" --project="Mobile Safari"
```

---

## MCP Server — AI Integration

The `mcp-server.ts` implements the **Model Context Protocol** so that any compatible AI client (GitHub Copilot, Claude Desktop, custom LLM agents) can interact with your test suite programmatically.

### Start the server

```bash
npm run mcp:server
# or
npx ts-node mcp-server.ts
```

### Available MCP tools

| Tool | Description |
|------|-------------|
| `run_tests` | Execute Playwright tests. Accepts optional `filter` (path/glob) and `project` parameters |
| `get_test_results` | Read `test-results/ai-report.json` — returns summary, per-test status, errors, and AI hints |
| `list_test_files` | List all `*.spec.ts` files in the `tests/` directory |

### VS Code integration

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright-ai": {
      "type": "stdio",
      "command": "npx",
      "args": ["ts-node", "mcp-server.ts"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

### Example MCP call (JSON-RPC)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "run_tests",
    "arguments": {
      "filter": "tests/unit-tests/",
      "project": "chromium"
    }
  }
}
```

---

## AI Reporter

`tools/ai-reporter.ts` is a custom Playwright reporter that writes structured JSON to `test-results/ai-report.json` after every run.

### Output schema

```json
{
  "runId": "2026-09-27T09:00:00.000Z",
  "summary": {
    "passed": 42,
    "failed": 2,
    "skipped": 1,
    "timedOut": 0,
    "total": 45,
    "durationMs": 123456
  },
  "tests": [
    {
      "title": "WeSendCV smoke checks > homepage loads",
      "file": "/tests/wesendcv.spec.ts",
      "project": "chromium",
      "status": "passed",
      "durationMs": 3210,
      "retries": 0,
      "error": null,
      "aiHint": null
    },
    {
      "title": "WeSendCV smoke checks > first job link has href",
      "file": "/tests/wesendcv.spec.ts",
      "project": "chromium",
      "status": "failed",
      "durationMs": 10001,
      "retries": 1,
      "error": {
        "message": "locator('.tpg-post-link') not found",
        "location": "tests/pages/WeSendCVPage.ts:72"
      },
      "aiHint": "Selector not found. Verify the locator in the Page Object matches current DOM. Use role or data-testid attributes for resilience."
    }
  ]
}
```

The `aiHint` field is automatically populated based on the error message pattern — no manual configuration needed.

---

## BasePage — Smart Base Class

`tests/pages/BasePage.ts` is the abstract base all Page Objects extend. It provides:

### Smart retry with exponential back-off

```typescript
// Retry up to 3 times, delays: 500ms → 1000ms → 2000ms
await this.retryAction(
  () => this.page.click('.submit-btn'),
  'click submit',
  3,
  500
);
```

### Performance measurement

```typescript
const response = await this.measureAction(
  () => this.page.goto('https://wesendcv.com'),
  'goto homepage'
);
// Logs { action: 'goto homepage', status: 'success', durationMs: 1234 }
```

### Structured action log for AI consumption

```typescript
// Every action is logged; retrieve at end of test:
const summary = page.getAISummary();
// { totalActions: 12, failures: 0, retries: 1, logs: [...] }
```

### Soft assertions (non-throwing)

```typescript
const visible = await this.softAssertVisible(locator, 'header');
// Returns false on failure instead of throwing — test continues
```

### Stable element wait

```typescript
// Waits for visible AND positionally stable (no layout shifts)
await this.waitForStable(locator);
```

---

## Custom Fixtures

`tests/fixtures.ts` re-exports an extended `test` object. Import it in specs instead of `@playwright/test`:

```typescript
import { test, expect } from '../fixtures';

test('API returns valid posts', async ({ apiContext }) => {
  const resp = await apiContext.get('/wp-json/wp/v2/posts');
  expect(resp.status()).toBe(200);
});
```

### Available fixtures

| Fixture | Type | Description |
|---------|------|-------------|
| `apiContext` | `APIRequestContext` | Pre-configured REST context with `E2E_BASE_URL` and optional `E2E_API_TOKEN` |
| `page` | `Page` | Standard Playwright page with **auto-trace-on-failure** — trace.zip is attached to failing test results automatically |

---

## Test Data & Configuration

### `tests/data/testConfig.ts`

Single source of truth — never hard-code magic numbers in test files:

```typescript
import { TEST_CONFIG } from './data/testConfig';

// Use timeouts
await page.goto(url, { timeout: TEST_CONFIG.timeouts.navigation });

// Use performance thresholds
expect(loadTime).toBeLessThan(TEST_CONFIG.performance.maxLoadTimeMs);

// Use retry policy
await retry(action, TEST_CONFIG.retry.networkActions, TEST_CONFIG.retry.baseDelayMs);
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `https://wesendcv.com` | Target base URL |
| `E2E_API_TOKEN` | *(empty)* | ****** for API requests |
| `E2E_USER` | `standard_user` | Test user username |
| `E2E_PASS` | `secret_sauce` | Test user password |
| `CI` | *(unset)* | Set by GitHub Actions; enables retries and adjusts workers |

---

## Dev Server & Visual Diffs

If a `demo/` directory is present, start the local server for visual baseline testing:

```bash
node tools/dev-server.js
# Open http://127.0.0.1:3000
```

### Perceptual diff workflow

```bash
# First run — creates baseline
node tools/compare.js demo/baseline.png artifacts/current.png artifacts/diff.png --threshold=0.03

# Subsequent runs — compares against baseline; exits non-zero if diff > 3%
node tools/compare.js demo/baseline.png artifacts/current.png artifacts/diff.png
```

Commit `demo/baseline.png` after visual approval.

---

## CI/CD Pipeline

`.github/workflows/ci.yml` runs on every push to `main` / `develop` and on all PRs:

| Job | What it does |
|-----|-------------|
| `test` | Runs full suite on Ubuntu + Windows × Node 18/20 |
| `security-audit` | `npm audit --audit-level=high` |
| `secrets-scan` | TruffleHog secret scan |

**Artifacts uploaded on every run:**
- `playwright-report-*` — HTML report (30-day retention)
- `playwright-traces-*` — trace.zip files (30-day retention)
- JUnit results published directly to PR checks via `EnricoMi/publish-unit-test-result-action`

---

## Test Coverage

| Category | Type | Location |
|---|---|---|
| Unit Tests | Positive | `tests/unit-tests/` |
| Integration Tests | Positive | `tests/integration-tests/` |
| Performance Tests | Positive | `tests/performance-tests/` |
| Security Tests | Mixed | `tests/security-tests/` |
| Validation Tests | Mixed | `tests/validation-tests/` |
| Mock Tests | Mixed | `tests/mock-tests/` |
| Interop Tests | Positive | `tests/interop-tests/` |
| Accessibility Tests | Positive | `tests/accessibility/` |
| Resilience Tests | Mixed | `tests/resilience/` |
| Network Resilience | Negative | `tests/network-resilience/` |
| i18n Tests | Positive | `tests/i18n-tests/` |
| E2E Tests | Positive | `tests/e2e/` |
| Chaos Tests | Negative | `tests/chaos-tests/` |
| Contract Tests | Positive | `tests/contract-tests/` |

---

## Types of Tests

<details>
<summary>Click to expand all 14 categories</summary>

### 1. Unit Tests (`tests/unit-tests/`)
Individual functions and API utility parsing in isolation.

### 2. Integration Tests (`tests/integration-tests/`)
Multi-step navigation and complete user journeys across components.

### 3. Performance Tests (`tests/performance-tests/`)
Page load time, First Contentful Paint (FCP), Time to First Byte (TTFB), resource counts.

### 4. Security Tests (`tests/security-tests/`)
HTTPS enforcement, XSS prevention, auth validation, secure header checks.

### 5. Validation Tests (`tests/validation-tests/`)
Input formats, broken links, invalid route handling, data integrity.

### 6. Mock Tests (`tests/mock-tests/`)
API failure simulation, slow network stubs, unavailable service handling.

### 7. Interop Tests (`tests/interop-tests/`)
Cross-browser CSS/JS feature compatibility, touch events, viewport preferences.

### 8. Accessibility Tests (`tests/accessibility/`)
Axe WCAG 2.1 AA scans, keyboard-only navigation, focus order, ARIA attributes.

### 9. Resilience Tests (`tests/resilience/`)
Asset loading failures, partial outages, degraded-state UI validation.

### 10. Network Resilience Tests (`tests/network-resilience/`)
Offline simulation, connection drops, slow 3G emulation.

### 11. i18n Tests (`tests/i18n-tests/`)
Language attributes, RTL layouts, pluralization edge cases.

### 12. E2E Tests (`tests/e2e/`)
Critical-path user flows using Page Objects — signup, search, upload.

### 13. Chaos Tests (`tests/chaos-tests/`)
Concurrent user simulation, race conditions, random delay injection.

### 14. Contract Tests (`tests/contract-tests/`)
Pact consumer-driven contract validation ensuring frontend/backend API compatibility.

</details>

---

## Architecture: Page Object Model

```
tests/pages/
├── BasePage.ts          ← Abstract base (retry, logging, timing, soft assert)
└── WeSendCVPage.ts      ← Concrete POM (extends BasePage)

tests/data/
├── urls.ts              ← URL constants
├── users.ts             ← User credentials (env-var backed)
└── testConfig.ts        ← Timeouts, thresholds, retry policy
```

### Creating a new Page Object

```typescript
import { BasePage } from './BasePage';
import { URLS } from '../data/urls';

export class MyPage extends BasePage {
  readonly url = URLS.myPage.base;

  get searchBox() {
    return this.page.locator('[data-testid="search"]');
  }

  async search(query: string): Promise<void> {
    await this.safeFill(this.searchBox, query, 'search box');
    await this.safeClick(this.page.locator('[type="submit"]'), 'search submit');
  }
}
```

---

## AI Agents — Chatmodes & Skills

### Chatmode prompts (`.github/chatmodes/`)

Pre-written prompt files that give LLM agents rich context about this framework:

| File | Purpose |
|------|---------|
| `🎭 healer.chatmode.md` | Auto-heal failing tests by suggesting selector or timeout fixes |
| `🎭 planner.chatmode.md` | Plan new test categories or page objects from a feature description |

### GitHub Copilot Skills (`.github/skills/`)

| Skill | Trigger | Effect |
|-------|---------|--------|
| `playwright-test-debugging` | Debugging failing tests | Loads systematic Playwright debugging guide |
| `code-review` | Reviewing test code | Enforces POM compliance, Playwright best practices, security rules |

---

## Best Practices

- **Never put raw selectors in test specs** — only in Page Object files
- **Use `BasePage` helpers** (`safeClick`, `safeFill`, `retryAction`) instead of raw Playwright calls in page objects
- **Import from `tests/fixtures.ts`** instead of `@playwright/test` when you need `apiContext` or auto-tracing
- **Use `TEST_CONFIG` constants** — never hard-code timeouts or thresholds
- **Prefer role/data-testid locators** over CSS class selectors for resilience
- **Avoid `page.waitForTimeout`** — use `locator.waitFor()`, `expect(locator).toBeVisible()`, or `page.waitForResponse()`
- **Commit baselines** (`demo/baseline.png`) after visual approval; never commit auto-generated diff images

---

## How to Extend

### Add a new page object

1. Create `tests/pages/MyPage.ts` extending `BasePage`
2. Add URL to `tests/data/urls.ts`
3. Write tests in the appropriate category folder
4. Import your page object and use centralized data

### Add a new test category

1. Create `tests/<category>/` folder
2. Add spec files following the existing naming convention
3. Add the folder to the CI workflow step list in `.github/workflows/ci.yml`

### Add a new MCP tool

1. Add a tool definition to the `TOOLS` array in `mcp-server.ts`
2. Implement the handler function
3. Dispatch it in the `dispatch()` function
4. Document it in this README

---

## Common Commands

```bash
# Run all tests
npm test

# Run specific category
npx playwright test tests/security-tests/

# Run with specific browser
npx playwright test --project=chromium

# Start AI/MCP server
npm run mcp:server

# Lint all TypeScript
npm run lint

# Format all files
npm run format

# Show HTML report
npm run test:report

# Open interactive trace viewer
npx playwright show-trace test-results/<test>/trace.zip

# Show Playwright codegen
npx playwright codegen https://wesendcv.com
```

---

## Troubleshooting

| Symptom | Solution |
|---------|----------|
| `ECONNREFUSED` in API tests | Check `E2E_BASE_URL` env var and network connectivity |
| Selector not found | Open the trace (`npx playwright show-trace`), inspect DOM, update the locator in the Page Object |
| Test times out | Increase `TEST_CONFIG.timeouts.navigation` or check for slow network conditions |
| Visual diff fails | Delete stale baseline and re-run to regenerate; commit after visual approval |
| MCP server not responding | Ensure `ts-node` is available: `npm install -g ts-node` |
| Playwright browsers missing | Run `npx playwright install --with-deps` |
| Windows path issues | Use PowerShell and run `npm ci` (not `npm install`) for deterministic installs |

---

## License & Attribution

**MIT License** — see [LICENSE](LICENSE) for details.

Built and maintained by **Padmaraj Nidagundi**  
Senior QA Automation Engineer  
[GitHub](https://github.com/padmarajnidagundi) · [LinkedIn](https://linkedin.com/in/padmarajnidagundi)

If this framework saved you time, consider ⭐ starring the repo and sharing it with your QA team!

---

> *Questions or feedback? Open an issue or start a discussion — contributions are welcome!*
