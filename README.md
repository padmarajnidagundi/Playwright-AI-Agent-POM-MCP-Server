
# Playwright AI Agent using Page Object Model (POM) architecture with MCP Server integration, chatmode prompts to feed (LLM, API, MCP) for automated web testing - Ready to use

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
- [Types of Tests](#types-of-tests)
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

This is my a compact, self-contained Playwright demo project showcasing motion assertions, perceptual diffs, and CI-friendly E2E testing patterns. Perfect for my interviews, demos, and learning test automation best practices. I have added types of testing, and it's ready to use.

<center>
    <a
        href="https://ibb.co/mFRDJLFY"><img src="https://i.ibb.co/mFRDJLFY/Padmaraj-nidagundi-Playwright-AI-Agent-POM-MCP-Server.jpg" alt="Padmaraj-nidagundi-Playwright-AI-Agent-POM-MCP-Server" border="0"></a>
</center>

## What This Repo Demonstrates

- **Motion sampling:** Capture `requestAnimationFrame` timestamps and compute timing gaps to assert animation health.
- **Perceptual diffs:** Pixel-level comparison using `pixelmatch` with baseline image workflow and diff artifacts.
- **Playwright setup:** `playwright.config.ts` with embedded `webServer` for the local demo.
- **Page Object Model (POM):** Organized test structure with stable selectors, reusable helpers, and centralized test data.
- **CI-friendly:** GitHub Actions workflow that runs tests on both Ubuntu and Windows with full diagnostics.
- **Negative testing:** Error handling validation (e.g., 404 responses, invalid navigation).

## Tech Stack and Libraries

| Category          | Technology/Library     | Version      | Purpose                                                                 |
|-------------------|-------------------------|--------------|-------------------------------------------------------------------------|
| Language          | TypeScript             | -            | Used for test files, configuration, and utilities                       |
| Runtime           | Node.js                | 18.x or 20.x | As specified in CI                                                      |
| Testing Framework | Playwright             | -            | For end-to-end and unit testing                                         |
| Build Tool        | npm                    | -            | For dependency management and scripts                                   |
| Library           | @playwright/test       | ^1.35.0      | Main Playwright testing library for browser automation and assertions  |
| Library           | @pact-foundation/pact  | ^16.0.2      | For contract testing (API consumer-provider agreements)                |
| Library           | @types/node            | ^24.10.1     | TypeScript type definitions for Node.js                                |
| Library           | axe-playwright         | ^2.2.2       | Accessibility testing integration with Axe                             |
| CI/CD             | GitHub Actions         | -            | Configured for cross-platform testing on Ubuntu and Windows            |
| Visual Diffing    | Pixelmatch             | -            | Custom tools for pixel-level comparison                                |
| MCP/Chatmode      | -                      | -            | Integration hints for AI-assisted debugging                            |
| Configuration     | Playwright config      | -            | For multi-browser support (Chromium, Firefox, WebKit)                  |

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
│   │   ├── urls.ts                # URL constants
│   │   └── users.ts               # User test data
│   ├── unit-tests/                # Unit tests - API & utility functions
│   │   └── api.spec.ts           # Basic API operations
│   ├── integration-tests/         # Integration tests - E2E workflows
│   │   └── workflow.spec.ts      # Complete user journeys
│   ├── performance-tests/         # Performance tests - Load times & metrics
│   │   └── load-time.spec.ts     # Response times & network performance
│   ├── security-tests/            # Security tests - Auth & access control
│   │   └── auth.spec.ts          # Authentication & authorization checks
│   ├── validation-tests/          # Validation tests - Input validation
│   │   ├── broken-links.spec.ts  # Broken link detection
│   │   ├── input-validation.spec.ts # Data integrity & format validation
│   │   └── invalid-route.spec.ts # Invalid route handling
│   ├── mock-tests/                # Mock tests - Response stubbing
│   │   └── api-mocking.spec.ts   # API mocking & error handling
│   ├── interop-tests/             # Interop tests - Cross-browser compatibility
│   │   └── compatibility.spec.ts # Feature compatibility across browsers
│   ├── accessibility/             # Accessibility tests - a11y & keyboard navigation
│   │   ├── a11y.spec.ts          # Axe accessibility checks
│   │   └── keyboard.spec.ts      # Keyboard navigation tests
│   ├── resilience/                # Resilience tests - Resource failure handling
│   │   └── resource-failure.spec.ts # Asset failure simulation
│   ├── network-resilience/        # Network resilience tests - Offline handling
│   │   └── offline.spec.ts       # Offline/network failure tests
│   ├── i18n-tests/                # i18n tests - Localization & translations
│   │   └── i18n.spec.ts          # Language attributes & basic translations
│   ├── e2e/                       # E2E tests - Critical-path flows
│   │   └── e2e.spec.ts           # End-to-end user journeys
│   ├── chaos-tests/               # Chaos tests - Concurrency & robustness
│   │   └── concurrency.spec.ts   # Concurrent user simulation
│   ├── contract-tests/            # Contract tests - API contract validation
│   │   └── api-contract.spec.ts  # API contract checks
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

### GitHub Actions: Auto-Run Tests on Every Commit

Tests automatically run on every push to `main` and `develop` branches, and on all pull requests.

**Features:**
- ✅ Runs on **Ubuntu** and **Windows** (cross-platform reliability)
- ✅ Tests against **Node 18.x** and **20.x** (version compatibility)
- ✅ Executes **all test categories** in parallel
- ✅ Uploads **test reports**, **traces**, and **artifacts** for review
- ✅ Publishes **unit test results** directly on GitHub PR checks

**What happens on commit:**
1. GitHub detects a new push or pull request
2. Workflow triggers automatically (no manual action needed)
3. Dependencies are installed and Playwright browsers are set up
4. All test suites run across multiple OS/Node versions
5. Test reports and artifacts are uploaded
6. Results appear in the PR/commit page

**View test results:**
- Open the **Actions** tab in your GitHub repository
- Click the workflow run to see detailed logs
- Download artifacts (reports, traces, screenshots) from the **Summary** page

## Test Coverage

| Test Category | Type | Purpose | Location |
|---|---|---|---|
| Unit Tests | Positive | Test individual functions and utilities in isolation | `tests/unit-tests/` |
| Integration Tests | Positive | Validate complete end-to-end user workflows | `tests/integration-tests/` |
| Performance Tests | Positive | Measure response times, load metrics, and resource efficiency | `tests/performance-tests/` |
| Security Tests | Positive | Validate authentication, authorization, and secure access | `tests/security-tests/` |
| Validation Tests | Positive | Test input validation, data integrity, and format validation | `tests/validation-tests/` |
| Mock Tests | Positive & Negative | Test error handling via response mocking and stubbing | `tests/mock-tests/` |
| Interop Tests | Positive | Verify cross-browser compatibility and feature support | `tests/interop-tests/` |
| Accessibility Tests | Positive | Catch ARIA/contrast/keyboard issues | `tests/accessibility/` |
| Resilience Tests | Positive & Negative | Simulate failed/slow responses and verify UI error states | `tests/resilience/` |
| Network-resilience Tests | Negative | Simulate offline/network failure and verify graceful handling | `tests/network-resilience/` |
| i18n Tests | Positive | Verify translations, RTL layouts, and pluralization | `tests/i18n-tests/` |
| E2E Tests | Positive | Full user journeys (signup, purchase, upload) using POM | `tests/e2e/` |
| Chaos Tests | Positive | Simulate concurrent users or DB failures for robustness | `tests/chaos-tests/` |
| Contract Tests | Positive | Ensure frontend/backend API compatibility | `tests/contract-tests/` |
| Vibe Test | Positive | Validate animation timing and visual consistency via perceptual diffs | `tests/vibe.spec.ts` |
| WeSendCV Smoke | Positive | Verify homepage loads with expected content | `tests/wesendcv.spec.ts` |
| WeSendCV 404 | Negative | Validate proper 404 error handling on invalid routes | `tests/wesendcv.spec.ts` |

## Types of Tests

This repository demonstrates **13 categories of testing** to provide comprehensive quality coverage:

### 1. **Unit Tests** (`tests/unit-tests/`)
- **Focus:** Individual functions and utilities
- **Example:** API parsing, email validation, timeout calculations
- **Run:** `npx playwright test tests/unit-tests/`

### 2. **Integration Tests** (`tests/integration-tests/`)
- **Focus:** End-to-end workflows across multiple components
- **Example:** Multi-step navigation, full user journeys
- **Run:** `npx playwright test tests/integration-tests/`

### 3. **Performance Tests** (`tests/performance-tests/`)
- **Focus:** Response times, load metrics, network efficiency
- **Example:** Page load time, First Contentful Paint, resource count
- **Run:** `npx playwright test tests/performance-tests/`

### 4. **Security Tests** (`tests/security-tests/`)
- **Focus:** Authentication, authorization, and secure access
- **Example:** HTTPS enforcement, XSS prevention, header validation
- **Run:** `npx playwright test tests/security-tests/`

### 5. **Validation Tests** (`tests/validation-tests/`)
- **Focus:** Input validation, data integrity, format compliance
- **Example:** Email/phone/URL validation, length constraints, malicious pattern detection
- **Run:** `npx playwright test tests/validation-tests/`

### 6. **Mock Tests** (`tests/mock-tests/`)
- **Focus:** Error handling via response mocking and stubbing
- **Example:** API failures, slow networks, unavailable services, XHR stubbing
- **Run:** `npx playwright test tests/mock-tests/`

### 7. **Interop Tests** (`tests/interop-tests/`)
- **Focus:** Cross-browser compatibility and feature support
- **Example:** CSS Grid support, ES6 features, touch events, viewport preferences
- **Run:** `npx playwright test tests/interop-tests/`

### 8. **Accessibility Tests** (`tests/accessibility/`)
- **Focus:** ARIA, contrast, keyboard navigation, and screen reader support
- **Example:** Axe accessibility checks, keyboard-only navigation, focus order
- **Run:** `npx playwright test tests/accessibility/`

### 9. **Resilience Tests** (`tests/resilience/`)
- **Focus:** Handling of resource failures and degraded conditions
- **Example:** Asset loading failures, partial outages, error state UI
- **Run:** `npx playwright test tests/resilience/`

### 10. **Network-resilience Tests** (`tests/network-resilience/`)
- **Focus:** Offline and network failure scenarios
- **Example:** No internet, slow connections, connection drops
- **Run:** `npx playwright test tests/network-resilience/`

### 11. **i18n Tests** (`tests/i18n-tests/`)
- **Focus:** Localization, translations, and international support
- **Example:** Language attributes, RTL layouts, pluralization
- **Run:** `npx playwright test tests/i18n-tests/`

### 12. **E2E Tests** (`tests/e2e/`)
- **Focus:** Critical-path user journeys and full workflows
- **Example:** Signup, purchase, upload flows using POM
- **Run:** `npx playwright test tests/e2e/`

### 13. **Chaos Tests** (`tests/chaos-tests/`)
- **Focus:** Concurrency, race conditions, and system robustness
- **Example:** Multiple users, DB failures, random delays
- **Run:** `npx playwright test tests/chaos-tests/`

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

**NpmJs:** [I will add here soon]

**GitHub:** https://github.com/padmarajnidagundi/Playwright-AI-Agent-POM-MCP-Server

---

**Questions or feedback?** Open an issue or reach out. Happy testing! 



## Using Chatmode prompts and the MCP flow

Chatmode prompts are text prompts (instructions + context) you feed to an LLM (remote or local). They can be used manually (paste into a chat UI) or programmatically (via an API or an MCP-connected local agent). Below are concise usage patterns and quick steps for both approaches.

This repository includes ready-made chatmode prompts under `.github/chatmodes/` (for example `healer.chatmode.md`, `planner.chatmode.md`). These are structured, human-authored prompts you give to an LLM (remote or local) to drive test planning, debugging, and automated repair.

Two common ways to use chatmode prompts:

- Manual / hosted LLM (fast):
  - Copy the contents of a chatmode file and paste it into a hosted LLM chat UI (OpenAI Chat, Claude, etc.), or send it programmatically to the provider API. This is ideal for one-off guidance and quick suggestions.
  - Example (PowerShell + OpenAI):
    ```powershell
    $env:OPENAI_API_KEY = "sk_..."
    $prompt = Get-Content .github/chatmodes/healer.chatmode.md -Raw
    curl -s https://api.openai.com/v1/chat/completions `
      -H "Authorization: Bearer $env:OPENAI_API_KEY" `
      -H "Content-Type: application/json" `
      -d (@{ model = "gpt-4o-mini" ; messages = @(@{ role = "user"; content = $prompt }) } | ConvertTo-Json)
    ```

- Programmatic / integrated (MCP or local agent):
  - For automation (test-healing, snapshots, programmatic edits) run a small local agent that reads chatmode markdown and forwards it to an LLM or a local LLM host. When combined with Playwright's MCP server (`npx playwright run-test-mcp-server`) the agent can request traces, screenshots and run tests programmatically.
  - The repo includes an example MCP configuration used by editor integrations (`.vscode/mcp.json`). If your Playwright CLI lacks `run-test-mcp-server`, update Playwright or add an npm script: `npm set-script mcp:start "npx playwright run-test-mcp-server"`.

Quick scaffold (recommended)

1. Add a tiny local agent `tools/ai-server.js` that accepts a `prompt` and calls your LLM endpoint (OpenAI or a local LLM host). Keep API keys in env vars only.

2. Add an npm script in `package.json`:
```json
"scripts": {
  "ai:start": "node --experimental-fetch tools/ai-server.js"
}
```

3. Start the dev server, MCP server and agent when you want automated assistance:
```powershell
node tools/dev-server.js        # optional demo site
npx playwright run-test-mcp-server
npm run ai:start
```

Security & best practices

- Never commit API keys. Use environment variables or CI secrets.
- Limit the agent's network exposure (bind to `localhost`) and protect it with local auth if needed.
- For local LLMs (Ollama, text-generation-webui, HF Inference on premise), point the agent to the local host endpoint instead of a public API.

If you want, I can scaffold `tools/ai-server.js` and the `ai:start` script for you, and add a short example that posts a chatmode file to the agent. Tell me whether you prefer a hosted provider (OpenAI/Anthropic) or a local LLM host and I'll create the scaffold.

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


