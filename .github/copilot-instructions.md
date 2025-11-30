<!-- Copilot/AI agent instructions tailored to this repository -->
# Copilot instructions — Playwright AI Agent POM MCP Server

Purpose
- Help an AI coding assistant be immediately productive in this repo: tests are Playwright-based, follow a Page Object Model, include visual-diff tooling, and provide optional MCP/chatmode integrations for assisted debugging.

Quick architecture summary
- Tests live under `tests/` and are organized by category (unit-, integration-, performance-, security-, validation-, mock-, interop-). See the `tests/` tree in `README.md`.
- Page Objects are in `tests/pages/` (example: `WeSendCVPage.ts`) and always import centralized data from `tests/data/` (example: `urls.ts`).
- Playwright configuration is `playwright.config.ts`: multi-project (chromium, firefox, webkit), reporters write `html`, `json`, `junit`, and `list`. Artifacts and results are stored under `playwright-report/` and `test-results/`.
- A small demo site and baseline images live in `demo/` and are served by `tools/dev-server.js` for visual tests using `tools/compare.js` (pixelmatch).
- Chatmode / MCP hints are present (examples: `test.chatmode.md`, `.github/chatmodes/`, and `.vscode/mcp.json`) to allow programmatic assistant interaction when an MCP server is available.

Essential developer workflows (commands)
- Install deps and Playwright browsers:
  ```powershell
  npm install
  npx playwright install --with-deps
  ```
- Run full test suite:
  ```powershell
  npm test
  ```
- Run a specific spec (headed for debugging):
  ```powershell
  npx playwright test tests/wesendcv.spec.ts --project=chromium --headed
  ```
- Show the HTML report:
  ```powershell
  npm run test:report
  npx playwright show-report
  ```
- Start the local demo server for visual tests:
  ```powershell
  node tools/dev-server.js
  # open http://127.0.0.1:3000
  ```
- Run perceptual diff tool (creates baseline if missing):
  ```powershell
  node tools/compare.js demo/baseline.png artifacts/current.png artifacts/diff.png --threshold=0.03
  ```

Project-specific patterns and conventions (do not deviate)
- Page Object Model (POM): create `tests/pages/<Name>Page.ts` with class methods for actions and assertions. Tests instantiate page objects and assert behaviors (see `tests/wesendcv.spec.ts`).
- Centralized data: keep URLs, users, and test constants in `tests/data/` (example: `urls.ts`). Tests and page objects import from these modules rather than hard-coding values.
- Test file placement: use the category folders under `tests/` — CI and reporters assume this layout.
- Reporters & artifacts: `playwright.config.ts` writes `json` to `test-results/results.json` and `junit.xml` at repo root; artifacts (screenshots/traces/videos) are uploaded by CI when failures occur. Keep artifact-reading tools pointed at these paths.
- Visual diffs: use `tools/compare.js` to produce/validate baselines. If a baseline is approved, commit `demo/baseline.png` to the repo.
- Avoid sleep-based waits: prefer Playwright waits (`waitForSelector`, `expect(locator).toBeVisible()`, `page.waitForResponse`) as the project expects stable, idempotent tests.

Integration points and external deps
- Playwright: `@playwright/test` (see `package.json`). CLI commands use `npx playwright`.
- Pixelmatch-based comparator: `tools/compare.js` (relies on `pixelmatch`) — visual baseline flow is part of tests (see `README.md`).
- MCP / chatmode: the repo provides chatmode prompts and a `.vscode/mcp.json` entrypoint. To enable programmatic AI-assisted debugging, try `npx playwright run-test-mcp-server` (may depend on Playwright version) or add an npm script to expose the command.

When making code changes, follow these micro-rules
- Edit selectors only in `tests/pages/*` Page Object files; tests should not contain raw selectors.
- Add test data to `tests/data/*` and import it in page objects/tests.
- Keep page methods small and single-purpose (one action per method). Tests orchestrate multi-step scenarios.
- If you change baseline images, explain the reason in the PR and commit only after visual approval.

Files to inspect for concrete examples
- `tests/pages/WeSendCVPage.ts` — canonical POM example
- `tests/wesendcv.spec.ts` — smoke and negative-tests using POM + data
- `tests/vibe.spec.ts` — animation timing + visual diff example
- `tools/compare.js` and `tools/dev-server.js` — visual diff and demo server
- `playwright.config.ts` — timeouts, projects, reporters, and `use` settings
- `package.json` — available npm scripts (`test`, `test:headed`, `test:report`)

Hints for AI assistants (practical, repository-specific)
- When proposing changes to tests, prefer editing/adding page object methods and small test-specs; avoid sweeping refactors across unrelated test categories.
- Use `npx playwright test <file>` when iterating on a single file to save time and isolate failures.
- For visual diffs, run the demo server locally and use `tools/compare.js` to reproduce CI behavior before updating baselines.
- If an MCP debug flow is requested, verify Playwright CLI has `run-test-mcp-server` available; if not, suggest adding an npm script and document how to start it in the PR description.

If anything here is unclear or you want deeper detail (for example, a full list of stable selectors, auth flows, or how CI uploads artifacts), tell me which area to expand and I will update this file.
