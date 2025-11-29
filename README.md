# Playwright AI Agent POM MCP Server / Ready to use automation page object model framework

## Table of Contents
- [What This Repo Demonstrates](#what-this-repo-demonstrates)
- [Repository Layout](#repository-layout)
- [Key Files Reference](#key-files-reference)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Dev Server](#dev-server)
- [Perceptual Diff / Baselines Workflow](#perceptual-diff--baselines-workflow)
- [CI/CD Notes](#cicd-notes)
- [Test Coverage](#test-coverage)
- [Architecture: Page Object Model (POM)](#architecture-page-object-model-pom)
- [Best Practices & Tips](#best-practices--tips)
- [How to Extend](#how-to-extend)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [License & Attribution](#license--attribution)
- [Contact](#contact)
- [Questions or feedback?](#questions-or-feedback)

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![NPM Version](https://img.shields.io/badge/npm-v7.0.0-orange)

A compact, self-contained Playwright demo project showcasing motion assertions, perceptual diffs, and CI-friendly E2E testing patterns. Perfect for my interviews, demos, and learning test automation best practices. I have added types of testing, and it's ready to use.

## What This Repo Demonstrates

- **Motion sampling:** Capture `requestAnimationFrame` timestamps and compute timing gaps to assert animation health.
- **Perceptual diffs:** Pixel-level comparison using `pixelmatch` with baseline image workflow and diff artifacts.
- **Playwright setup:** `playwright.config.ts` with embedded `webServer` for the local demo.
- **Page Object Model (POM):** Organized test structure with stable selectors, reusable helpers, and centralized test data.
- **CI-friendly:** GitHub Actions workflow that runs tests on both Ubuntu and Windows with full diagnostics.
- **Negative testing:** Error handling validation (e.g., 404 responses, invalid navigation).

## Repository Layout

```
Playwright-AI-Agent-POM-MCP-Server/
├── demo/                          # Demo site served by dev-server.js
│   ├── index.html                 # Animated UI with window.sampleAnimationFrames()
│   └── baseline.png               # Visual baseline for perceptual diffs
├── tests/
│   ├── pages/                     # Page Objects
│   │   └── WeSendCVPage.ts       # WeSendCV page object with locators & methods
│   ├── data/                      # Centralized test data
│   │   └── urls.ts               # URL constants
│   ├── vibe.spec.ts              # Animation timing + perceptual diff test
│   └── wesendcv.spec.ts          # Smoke + negative tests (uses POM + data)
├── tools/
│   ├── compare.js                # Pixelmatch-based diff comparator CLI
│   └── dev-server.js             # Static HTTP server for demo/
├── .github/workflows/
│   └── ci.yml                    # GitHub Actions multi-OS pipeline
├── playwright.config.ts           # Playwright configuration (browsers, timeouts, traces)
├── package.json                   # NPM scripts and dependencies
└── README.md                      # This file
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `tests/pages/WeSendCVPage.ts` | Page Object for WeSendCV site with locators, navigation, and assertion methods |
| `tests/data/urls.ts` | Centralized URL constants for WeSendCV and other test targets |
| `tests/wesendcv.spec.ts` | Test specs using POM + data (smoke & negative tests) |
| `tests/vibe.spec.ts` | Animation timing + perceptual diff test |
| `tools/compare.js` | CLI comparator — creates baseline if missing, writes `diff.png` |
| `demo/index.html` | Animated demo UI exposing `window.sampleAnimationFrames(durationMs)` |
| `playwright.config.ts` | Multi-browser projects, webServer config, trace/screenshot retention on failure |

## Installation

### Windows PowerShell
```powershell
cd C:\Playwright-AI-Agent-POM-MCP-Server

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Verify installation
npx playwright test --version
```

### macOS / Linux (bash/zsh)
```bash
cd ~/Playwright-AI-Agent-POM-MCP-Server

npm install
npx playwright install
```

## Running Tests

### Full Test Suite
```powershell
npm test
```
Runs all tests across all configured browsers (Chromium, Firefox, WebKit).

### Specific Test
```powershell
npx playwright test tests/wesendcv.spec.ts --project=chromium
```

### Headed Mode (for debugging)
```powershell
npx playwright test tests/vibe.spec.ts --headed --project=chromium
```

### CI-style Test Run
```powershell
npm run test:ci
```
Matches the GitHub Actions pipeline configuration.

## Dev Server

Start the demo server for manual testing or local development:

```powershell
node tools/dev-server.js
# Open http://127.0.0.1:3000 in your browser
```

## Perceptual Diff / Baselines Workflow

The `tools/compare.js` tool performs pixel-level diffs using `pixelmatch`.

**First run (baseline creation):**
```powershell
node tools/compare.js demo/baseline.png artifacts/current.png artifacts/diff.png --threshold=0.03
```
- If baseline does not exist, it is created and the tool exits successfully.
- This allows you to approve the baseline before running assertions.

**Subsequent runs (comparison):**
- Compares `current.png` against `baseline.png`.
- Writes `diff.png` highlighting pixel differences.
- Exits non-zero if percent-difference exceeds threshold (default 0.03 = 3%).

**Best practice:** Commit `demo/baseline.png` to the repo after visual approval.

## CI/CD Notes

The `.github/workflows/ci.yml` pipeline:
- Runs `npm ci` and `npx playwright install --with-deps`
- Executes `npm run test:ci` on `ubuntu-latest` and `windows-latest`
- Uploads test artifacts (screenshots, traces, videos) on failure
- Ensures cross-platform test reliability

For deterministic visual diffs in CI, always commit baselines locally after approval.

## Test Coverage

| Test | Type | Purpose |
|------|------|---------|
| `vibe.spec.ts` | Positive | Validates animation timing and visual consistency via perceptual diffs |
| `wesendcv.spec.ts` (smoke) | Positive | Verifies https://wesendcv.com homepage loads with expected content |
| `wesendcv.spec.ts` (404) | Negative | Validates proper 404 error handling on invalid routes |

## Architecture: Page Object Model (POM)

This project follows the **Page Object Model** pattern for maintainable, scalable tests.

### Structure
- **Page Objects** (`tests/pages/`): Encapsulate selectors, navigation, and page-specific actions
- **Test Data** (`tests/data/`): Centralized constants (URLs, test users, products, etc.)
- **Test Specs** (`tests/*.spec.ts`): Use page objects and data, focus on test logic and assertions

### Example: WeSendCV Tests

**Page Object (`tests/pages/WeSendCVPage.ts`):**
```typescript
export class WeSendCVPage {
  readonly url = URLS.wesendcv.base;
  
  async gotoHomepage() { /* ... */ }
  async verifyHomepageLoaded() { /* ... */ }
  async gotoInvalidPage(path: string) { /* ... */ }
}
```

**Test Data (`tests/data/urls.ts`):**
```typescript
export const URLS = {
  wesendcv: {
    base: 'https://wesendcv.com',
    invalidPage: '/invalid-page-that-does-not-exist',
  },
};
```

**Test Spec (`tests/wesendcv.spec.ts`):**
```typescript
test('homepage loads', async ({ page }) => {
  const wesendcvPage = new WeSendCVPage(page);
  const resp = await wesendcvPage.gotoHomepage();
  expect(resp?.ok()).toBeTruthy();
});
```

### Benefits
- **Isolation:** Tests don't know about selectors or implementation details
- **Reusability:** Page methods shared across multiple test specs
- **Maintainability:** Update selectors in one place, all tests benefit
- **Scalability:** Easy to add new page objects and test data as the suite grows

## Best Practices & Tips

- **Selectors:** Use stable `id` or `data-test` attributes instead of brittle CSS/XPath.
- **Page Objects:** Keep POM methods focused on single actions; avoid god-methods.
- **Test Data:** Extract URLs, credentials, and fixtures into `tests/data/` files.
- **Artifacts:** Enable traces and screenshots in `playwright.config.ts` for faster triage.
- **Baselines:** Keep one baseline per viewport/OS if visual differences are expected.
- **Isolation:** Tests should be independent and idempotent; avoid test-to-test dependencies.
- **No hard sleeps:** Use Playwright's built-in waits (`waitForSelector`, `waitForNavigation`, etc.).
- **Negative tests:** Always validate error paths and edge cases alongside happy paths.

## How to Extend

### Add a New Page Object
1. Create `tests/pages/MyPage.ts`
2. Import page data from `tests/data/`
3. Define locators as class properties
4. Implement action methods (goto, click, fill, verify, etc.)
5. Export the class for use in test specs

Example:
```typescript
// tests/pages/LoginPage.ts
import { Page, expect } from '@playwright/test';
import { URLS } from '../data/urls';

export class LoginPage {
  constructor(readonly page: Page) {}
  
  async gotoLoginPage() {
    await this.page.goto(URLS.app.login);
  }
  
  async login(username: string, password: string) {
    await this.page.fill('[data-test="username"]', username);
    await this.page.fill('[data-test="password"]', password);
    await this.page.click('[data-test="login-btn"]');
  }
}
```

### Add Test Data
1. Create `tests/data/mydata.ts`
2. Export constants (URLs, users, products, etc.)
3. Import and use in page objects and test specs

Example:
```typescript
// tests/data/users.ts
export const TEST_USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  admin: {
    username: 'admin',
    password: 'admin_pass',
  },
};
```

### Add a New Test
1. Create `tests/myfeature.spec.ts`
2. Import page objects and test data
3. Use `test.beforeEach()` to initialize page objects
4. Write test cases focusing on workflow and assertions
5. Run: `npx playwright test tests/myfeature.spec.ts`

## Common Commands

```powershell
# Install
npm install
npx playwright install --with-deps

# Test
npm test                           # Full suite
npm run test:ci                    # CI-style run
npx playwright test --headed       # Debug mode
npx playwright test --debug        # Step through with Inspector

# Dev
node tools/dev-server.js           # Start demo server
node tools/compare.js [...]        # Run perceptual diff

# Clean
npm run clean                      # Remove artifacts (if script exists)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout on Windows | Increase timeouts in `playwright.config.ts` or run with `--retries=1` |
| Visual diffs fail unexpectedly | Review `artifacts/diff.png` and `artifacts/current.png`, update baseline if change is approved |
| Flaky selectors | Use `data-test` attributes, increase wait timeouts, avoid `nth-child` selectors |
| Browser install fails | Run `npx playwright install --with-deps` to include OS-level dependencies |
| Port 3000 already in use | Modify `dev-server.js` to use a different port |
| Page Object not found | Ensure import path matches file location (e.g., `./pages/WeSendCVPage`) |

## License & Attribution

This demo repository is intended for learning, interview prep, and demonstration use. Feel free to adapt and re-use the code, patterns, and architecture as needed for your projects.

---

## MIT License

MIT License - feel free to use in your projects

## Contact

**Author:** Padmaraj Nidagundi

**Email:** padmaraj.nidagundi@gmail.com

**LinkedIn:** https://www.linkedin.com/in/padmarajn/

**NpmJs:** [Add your NpmJs profile link here]

**GitHub:** https://github.com/padmarajnidagundi/Playwright-AI-Agent-POM-MCP-Server

---

**Questions or feedback?** Open an issue or reach out. Happy testing! 



# Learn How to use the Chatmode & MCP (Model Context Protocol) with my repo.

## For Chatmode (AI-driven test assistance) and MCP usage instructions, see below.

This repository includes example "chatmode" prompts and a small MCP configuration so you can use conversational agents to help debug, plan, and heal Playwright tests.

- What it is: Chatmode files are written prompts that guide an AI test agent (examples live under `.github/chatmodes/`). MCP (Model Context Protocol) is a lightweight server integration pattern used by editor/assistant tooling to exchange messages with the local test runner and the repo.

Files to inspect:
- `.github/chatmodes/` — ready-made chatmode agent prompts (e.g. ` healer.chatmode.md`) for debugging and healing tests.
- `test.chatmode.md` — example test-plan style chat prompt you can use as an input to a chat agent.
- `.vscode/mcp.json` — a small MCP client configuration that points to a local server command for editor integration.

Quick start (local, minimal)Ignore below 1,2 and 3 step! because you installed alldependency already.:

1. Install dependencies (if not already):

```powershell
cd C:\Playwright-AI-Agent-POM-MCP-Server
npm install
npx playwright install --with-deps
```

2. Start any local demo server you want to exercise (optional):

```powershell
# serve the demo site used by visual tests
node tools/dev-server.js
```

3. Start the Playwright MCP server (used by some editor/assistant integrations):

```powershell
# this matches the command in .vscode/mcp.json
npx playwright run-test-mcp-server
```

Note: `package.json` in this repo contains standard Playwright scripts but may not define an explicit `run-test-mcp-server` script. The `npx` invocation above relies on Playwright's CLI. If you prefer an npm script, add one locally, for example:

```powershell
npm set-script mcp:start "npx playwright run-test-mcp-server"
```

Using chatmodes with an assistant or editor

- Paste `test.chatmode.md` into your LLM chat session as the plan, or open the `.github/chatmodes/*` file in an editor that exposes it to your assistant.
- With the MCP server running, some VS Code extensions (or local agents) can attach to the Playwright process to collect snapshots, run a failing test in debug mode, and return actionable fixes.

Example debugging workflow

1. Run tests to reproduce the failure:

```powershell
npx playwright test tests/wesendcv.spec.ts --project=chromium
```

2. Open the relevant chatmode prompt (e.g. `🎭 healer.chatmode.md`) in your assistant or editor and attach it to the running MCP session. The assistant will:
- Run or debug failing tests
- Capture page snapshots and console/network logs
- Suggest selector fixes or code changes

3. Apply suggested fixes locally, re-run tests, and iterate.

Troubleshooting & tips

- If `npx playwright run-test-mcp-server` isn't available, ensure your `@playwright/test` is a recent version and that Playwright CLI exposes the command for your release. Upgrading Playwright may add this capability.
- If your editor doesn't auto-detect `.vscode/mcp.json`, you can still use chatmode files by copying their contents into any LLM chat session or by using a local agent that accepts markdown prompts.
- Keep sensitive data out of chatmode files. Use placeholders for secrets and provide them via secure environment variables or CI secrets.

This integration pattern is designed to let you combine Playwright's rich diagnostics with AI-driven debugging: use the chatmode prompts as repeatable, documented instructions for the assistant, and use MCP (when available) to let the assistant interact programmatically with tests and the browser.

# Contributing to Playwright AI Agent POM MCP Server

Thank you for considering contributing to this project! Here are some guidelines to help you get started.

## How to Contribute

1. **Fork the repository**: Click on the "Fork" button at the top right of the page.
2. **Clone your fork**: Use `git clone <your-fork-url>` to clone your fork locally.
3. **Create a new branch**: Use `git checkout -b <your-branch-name>` to create a new branch for your changes.
4. **Make your changes**: Implement your changes and commit them with clear messages.
5. **Push to your fork**: Use `git push origin <your-branch-name>` to push your changes.
6. **Create a pull request**: Go to the original repository and click on "New Pull Request".

## Code of Conduct

Please adhere to the [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

## Questions?

If you have any questions, feel free to open an issue or reach out to the maintainers.


