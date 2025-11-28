# Playwright POM with MCP server

Compact Playwright demo project that verifies a UI "vibe": animation timing checks + perceptual diffs. This repository is a small, self-contained showcase you can use in interviews or demos to explain motion assertions, artifact generation, and CI workflows that include Windows-friendly commands.

**What this repo demonstrates**
- **Motion sampling:** capture requestAnimationFrame timestamps and compute timing gaps to assert animation health.
- **Perceptual diffs:** pixel-level comparison using `pixelmatch` with baseline image workflow and diff artifacts.
- **Playwright setup:** `playwright.config.ts` with an embedded `webServer` for the local demo.
- **CI-friendly:** GitHub Actions workflow that runs tests on both Ubuntu and Windows.

**Repository Layout**
- `demo/` : Demo site served by `tools/dev-server.js` (main demo page: `demo/index.html`).
- `tests/` : Playwright tests and placeholders. The primary demo tests are `tests/vibe.spec.ts` and `tests/wesendcv.spec.ts` (smoke test for https://wesendcv.com).
- `tools/` : Utilities used by tests and the demo (`compare.js`, `dev-server.js`).
- `playwright.config.ts` : Playwright configuration (webServer, baseURL, trace settings).
- `package.json` : NPM scripts for running tests and small utilities.
- `.github/workflows/ci.yml` : CI pipeline (Ubuntu + Windows matrix).

**Key Files (quick reference)**
- `demo/index.html` : Animated demo UI exposing `window.sampleAnimationFrames(durationMs)`.
- `tools/compare.js` : Pixelmatch-based CLI comparator — creates baseline if missing and writes `diff.png`.
- `tests/vibe.spec.ts` : Samples animation frames, asserts timing, captures screenshots, runs perceptual compare.
- `tests/wesendcv.spec.ts` : Smoke test that validates `https://wesendcv.com` loads and captures a screenshot.

**How to install (Windows PowerShell)**
```powershell
cd C:\2026
# install deps
npm install

# install Playwright browsers
npx playwright install
OR
npx playwright install --with-deps

# run full suite (multi-browser per config)
npm test
```

**How to run tests locally**
- Run full suite (uses `playwright.config.ts` webServer):
```powershell
npm test
```
- Run a specific test (example):
```powershell
npx playwright test tests/wesendcv.spec.ts --project=chromium
```
- Run headed (for debugging):
```powershell
npx playwright test tests/vibe.spec.ts --headed --project=chromium
```

**Dev server**
- Start the static demo server manually (useful for manual QA):
```powershell
node tools/dev-server.js
# open http://127.0.0.1:3000 in a browser
```

**Perceptual diff / baselines workflow**
- The `tools/compare.js` tool performs perceptual diffs using `pixelmatch` and writes a diff image.
- On first run, if the baseline (`demo/baseline.png`) does not exist, the tool will copy the current screenshot into the baseline path and exit with success — this makes the first run non-failing so you can approve a baseline image.
- After a baseline exists, comparisons produce a diff (`artifacts/diff.png` or specified output) and exit non-zero if the percent-difference exceeds the configured threshold.
- To run compare manually:
```powershell
node tools/compare.js demo/baseline.png artifacts/current.png artifacts/diff.png --threshold=0.03
```

**CI Notes**
- The included workflow `.github/workflows/ci.yml` runs `npm ci`, installs Playwright browsers, and executes `npm run test:ci` on both `ubuntu-latest` and `windows-latest`.
- To ensure deterministic comparisons in CI, commit `demo/baseline.png` to the repo after you’ve approved the visual baseline locally.

**Best Practices & Tips**
- Keep a committed baseline per target viewport / OS if visual differences are expected across environments.
- Prefer non-flaky selectors: use `id` or `data-test` attributes.
- Use traces and screenshots (Playwright artifacts) to triage failures — Playwright is configured to retain traces on failure in `playwright.config.ts`.
- If you want faster, repeatable test runs, run headless and pin Playwright versions in `package.json`.

**How to extend or author new tests**
1. Add Page Object(s) under `tests/pages/` for any page with repeated logic.
2. Place test data in `tests/data/` and reference it from specs.
3. Add a new spec under `tests/` — tests should be isolated and idempotent.
4. Use `tools/compare.js` for any image-based assertion or call it programmatically by spawning the script in your test.

**Common commands**
- Install deps: ``npm install``
- Install Playwright browsers: ``npx playwright install --with-deps``
- Run tests: ``npm test``
- Run CI-style tests: ``npm run test:ci``
- Start demo server: ``node tools/dev-server.js``

**Troubleshooting**
- If tests timeout on Windows, increase Playwright timeouts in `playwright.config.ts` or run with `--retries=1` while investigating flakiness.
- If visual diffs fail unexpectedly, review the saved `artifacts/diff.png` and `artifacts/current.png`, then update the baseline intentionally if the change is approved.

**License & attribution**
This demo repository is intended for learning and interview/demo use. Adapt and re-use the ideas and code as you need.

---
If you want, I can:
- run `npm install` and execute the tests here and report results,
- create a small helper to approve/update baselines from the command line,
- or remove the placeholder spec files fully (delete) if you prefer a cleaner tree.
# Playwright-AI-Agents — Playwright Test Suite & Generator Guide

This repo contains Playwright tests for the SauceDemo checkout flow and an opinionated Playwright Test Generator (prompt-driven) that scaffolds tests, POMs, helpers, data files, config and a README aligned to our code standards.

Purpose
- Provide reliable, maintainable E2E tests.
- Share the generator prompt & patterns so teams can reproduce the same structure and quality.
- Make onboarding and test creation fast and consistent.

What I changed (short)
- Updated the repository generator prompt so that when asked to "generate tests" it:
  - Always scaffolds Page Objects (tests/pages), helpers (tests/utils.ts), data (tests/data), and tests (tests/*.spec.ts).
  - Produces a CI-friendly playwright.config.ts and package.json with standard scripts.
  - Updates README.md with exact install/run/auth instructions.
  - Enforces best-practices: POM, stable selectors (id/data-test), no hard sleeps, parseCurrency helper, diagnostics (screenshots/traces), parallel-first tests.
  - Never hardcodes secrets and documents env overrides.

Why this matters
- Consistency: All generated tests follow the same structure and style, making reviews and maintenance easier.
- Stability: Isolate auth via storageState and use robust selectors and wait strategies to reduce flakiness.
- Speed: Reuse authenticated storageState to avoid repeated UI logins and shorten test runs.
- Triage: Built-in artifacts (screenshots, traces) make debugging faster.

Repository structure (key files)
- tests/
  - pages/ — Page Objects (InventoryPage, CartPage, CheckoutPage)
  - data/ — test data (users.ts, products.ts)
  - utils.ts — helpers (parseCurrency, waits)
  - *.spec.ts — test specs (happy-path, validation, math)
- playwright.config.ts — multi-browser projects + diagnostics
- package.json — scripts: test, test:headed, test:report
- .github/chatmodes/🎭 generator.chatmode.md — generator prompt (updated)
- README.md — this file (shareable knowledge)

How to run (macOS / zsh)
```bash
# install deps
npm install

# install Playwright browsers
npx playwright install

# run full suite (multi-browser per config)
npm test

# run a single spec
npx playwright test [math.spec.ts](http://_vscodecontentref_/0)

# run headed for debugging (Chromium)
npx playwright test [math.spec.ts](http://_vscodecontentref_/1) --headed --project=chromium