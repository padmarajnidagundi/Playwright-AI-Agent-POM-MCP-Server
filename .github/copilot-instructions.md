<!-- Copilot/AI agent instructions tailored to this repository -->
# Copilot instructions — Playwright AI Agent POM MCP Server

Purpose
- Help AI coding assistants and QA engineers work productively in this repo. Tests use Playwright, Page Object Model, centralized data, structured AI reports, and an MCP server.

Quick architecture summary
- Tests live under `tests/` and are organized by category (unit-, integration-, performance-, security-, validation-, mock-, interop-). See the `tests/` tree in `README.md`.
- Page Objects are in `tests/pages/` (example: `IndiaRealTimePage.ts`) and always import centralized data from `tests/data/` (example: `urls.ts`).
- Playwright configuration is `playwright.config.ts`: multi-project (chromium, firefox, webkit), reporters write `html`, `json`, `junit`, and `list`. Artifacts and results are stored under `playwright-report/` and `test-results/`.
- Visual baseline tooling is not part of the current repository. Do not reference missing `demo/`, `tools/dev-server.js`, or `tools/compare.js` files.
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
  npx playwright test tests/indiaRealtime.spec.ts --project=chromium --headed
  ```
- Show the HTML report:
  ```powershell
  npm run test:report
  npx playwright show-report
  ```

Project-specific patterns and conventions (do not deviate)
- Page Object Model (POM): create `tests/pages/<Name>Page.ts` with class methods for actions and assertions. Tests instantiate page objects and assert behaviors (see `tests/indiaRealtime.spec.ts`).
- Centralized data: keep URLs, users, and test constants in `tests/data/` (example: `urls.ts`). Tests and page objects import from these modules rather than hard-coding values.
- Test file placement: use the category folders under `tests/` — CI and reporters assume this layout.
- Reporters & artifacts: `playwright.config.ts` writes `json` to `test-results/results.json` and `junit.xml` at repo root; artifacts (screenshots/traces/videos) are uploaded by CI when failures occur. Keep artifact-reading tools pointed at these paths.
- Keep external configuration in `tests/data/` or environment variables. Do not hard-code environment-specific URLs in specs.
- Avoid sleep-based waits: prefer Playwright waits (`waitForSelector`, `expect(locator).toBeVisible()`, `page.waitForResponse`) as the project expects stable, idempotent tests.

Integration points and external deps
- Playwright: `@playwright/test` (see `package.json`). CLI commands use `npx playwright`.
- Optional visual tooling is not currently included.
- MCP / chatmode: the repo provides chatmode prompts and a `.vscode/mcp.json` entrypoint. To enable programmatic AI-assisted debugging, try `npx playwright run-test-mcp-server` (may depend on Playwright version) or add an npm script to expose the command.

When making code changes, follow these micro-rules
- Edit selectors only in `tests/pages/*` Page Object files; tests should not contain raw selectors.
- Add test data to `tests/data/*` and import it in page objects/tests.
- Keep page methods small and single-purpose (one action per method). Tests orchestrate multi-step scenarios.
- If you change baseline images, explain the reason in the PR and commit only after visual approval.

Files to inspect for concrete examples
- `tests/pages/IndiaRealTimePage.ts` — canonical POM example
- `tests/indiaRealtime.spec.ts` — smoke and negative-tests using POM + data
- `playwright.config.ts` — timeouts, projects, reporters, and `use` settings
- `package.json` — available npm scripts (`test`, `test:headed`, `test:report`)

Agent skills available in this repo
- `.github/skills/playwright-test-debugging/SKILL.md` — auto-loaded when debugging failing tests
- `.github/skills/code-review/SKILL.md` — auto-loaded when reviewing, auditing, or inspecting test code; enforces POM compliance, Playwright best practices, security rules, and coverage completeness

Hints for AI assistants (practical, repository-specific)
- When proposing changes to tests, prefer editing/adding page object methods and small test-specs; avoid sweeping refactors across unrelated test categories.
- Use `npx playwright test <file>` when iterating on a single file to save time and isolate failures.
- For visual diffs, run the demo server locally and use `tools/compare.js` to reproduce CI behavior before updating baselines.
- If an MCP debug flow is requested, verify Playwright CLI has `run-test-mcp-server` available; if not, suggest adding an npm script and document how to start it in the PR description.

If anything here is unclear or you want deeper detail (for example, a full list of stable selectors, auth flows, or how CI uploads artifacts), tell me which area to expand and I will update this file.
