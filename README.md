# Playwright AI Agent POM MCP Server

A compact, self-contained Playwright demo project showcasing motion assertions, perceptual diffs, and CI-friendly E2E testing patterns. Perfect for interviews, demos, and learning test automation best practices.

## What This Repo Demonstrates

- **Motion sampling:** Capture `requestAnimationFrame` timestamps and compute timing gaps to assert animation health.
- **Perceptual diffs:** Pixel-level comparison using `pixelmatch` with baseline image workflow and diff artifacts.
- **Playwright setup:** `playwright.config.ts` with embedded `webServer` for the local demo.
- **Page Object Model (POM):** Organized test structure with stable selectors and reusable helpers.
- **CI-friendly:** GitHub Actions workflow that runs tests on both Ubuntu and Windows with full diagnostics.
- **Negative testing:** Error handling validation (e.g., 404 responses, invalid navigation).

## Repository Layout

```
Playwright-AI-Agent-POM-MCP-Server/
├── demo/                          # Demo site served by dev-server.js
│   ├── index.html                 # Animated UI with window.sampleAnimationFrames()
│   └── baseline.png               # Visual baseline for perceptual diffs
├── tests/
│   ├── pages/                     # Page Objects (future expansion)
│   ├── data/                      # Test data files (future expansion)
│   ├── vibe.spec.ts              # Animation timing + perceptual diff test
│   └── wesendcv.spec.ts          # Smoke + negative tests for https://wesendcv.com
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
| `demo/index.html` | Animated demo UI exposing `window.sampleAnimationFrames(durationMs)` |
| `tools/compare.js` | CLI comparator — creates baseline if missing, writes `diff.png` |
| `tests/vibe.spec.ts` | Samples animation frames, asserts timing, captures screenshots, runs perceptual compare |
| `tests/wesendcv.spec.ts` | Smoke test validates `https://wesendcv.com` loads; negative test validates 404 handling |
| `playwright.config.ts` | Multi-browser projects, webServer config, trace/screenshot retention on failure |

## Installation

### Windows PowerShell
```powershell
cd C:\Playwright-AI-Agent-POM-MCP-Server

# Install dependencies
npm install

# Install Playwright browsers (with system dependencies on Windows)
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

## Best Practices & Tips

- **Selectors:** Use stable `id` or `data-test` attributes instead of brittle CSS/XPath.
- **Artifacts:** Enable traces and screenshots in `playwright.config.ts` for faster triage.
- **Baselines:** Keep one baseline per viewport/OS if visual differences are expected.
- **Isolation:** Tests should be independent and idempotent; avoid test-to-test dependencies.
- **No hard sleeps:** Use Playwright's built-in waits (`waitForSelector`, `waitForNavigation`, etc.).
- **Negative tests:** Always validate error paths and edge cases alongside happy paths.

## How to Extend

### Add a New Test
1. Create `tests/myfeature.spec.ts`
2. Use existing Page Objects from `tests/pages/` or create new ones
3. Reference test data from `tests/data/` if applicable
4. Run: `npx playwright test tests/myfeature.spec.ts`

### Add a Page Object
1. Create `tests/pages/MyPage.ts`
2. Export a class with locators and action methods
3. Import and use in your test specs

### Add Test Data
1. Create `tests/data/mydata.ts`
2. Export test fixtures (users, products, etc.)
3. Import in test specs as needed

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

## License & Attribution

This demo repository is intended for learning, interview prep, and demonstration use. Feel free to adapt and re-use the code, patterns, and architecture as needed for your projects.

---

**Questions or feedback?** Open an issue or reach out. Happy testing! 🎭