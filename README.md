# Playwright AI Agent POM MCP Framework

A practical Playwright, Page Object Model (POM), and AI-agent testing framework for web, API, accessibility, security, resilience, and mobile checks.

[![CI](https://github.com/padmarajnidagundi/Playwright-AI-Agent-POM-MCP-Server/actions/workflows/ci.yml/badge.svg)](https://github.com/padmarajnidagundi/Playwright-AI-Agent-POM-MCP-Server/actions)
[![Playwright](https://img.shields.io/badge/Playwright-1.65.1-45ba4b)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Quick start

Requirements: Node.js 20+.

```bash
npm ci
npx playwright install --with-deps
npm run test:smoke
```

Use Chromium for the fastest local feedback:

```bash
npm run test:chromium
npm run test:headed
npm run test:report
```

Set a target application with an environment variable:

```bash
E2E_BASE_URL=https://your-app.example npm run test:smoke
E2E_API_TOKEN=your-token npm run test:chromium
```

PowerShell:

```powershell
$env:E2E_BASE_URL="https://your-app.example"
npm run test:smoke
```

## Common commands

| Command | Purpose |
|---|---|
| `npm test` | Run the complete configured suite |
| `npm run test:unit` | Run platform and utility unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:smoke` | Run the smoke suite in Chromium |
| `npm run test:a11y` | Run accessibility and keyboard checks |
| `npm run test:security` | Run security-focused Playwright specs |
| `npm run test:mobile` | Run mobile-project coverage |
| `npm run test:chromium` | Run the full suite in Chromium |
| `npm run test:headed` | Run in headed mode |
| `npm run test:report` | Open the HTML report |
| `npm run typecheck` | Check TypeScript types |
| `npm run format:check` | Check formatting |
| `npm run mcp:server` | Start the JSON-RPC/MCP server |

To run one spec or category:

```bash
npx playwright test tests/indiaRealtime.spec.ts --project=chromium
npx playwright test tests/security-tests/ --project=chromium
npx playwright test tests/indiaRealtime.spec.ts --project=chromium --headed
```

## Architecture

```text
AI agent / MCP client
        |
        v
mcp-server.ts  ── test selection, failure analysis, reporting, guarded healing
        |
        v
Playwright runner
        |
        +-- tests/*.spec.ts
        +-- tests/pages/*Page.ts
        +-- tests/data/*.ts
        +-- tools/ai-reporter.ts
        +-- tools/platform/*
```

- **Specs** orchestrate scenarios and assertions.
- **Page Objects** own selectors and UI actions. Keep selectors out of spec files.
- **Test data** belongs in `tests/data/`; configure URLs and tokens through environment variables.
- **Fixtures** provide API contexts and failure tracing.
- **Reporter** creates an AI-readable failure report.
- **MCP server** lets compatible agents run tests and inspect results without bypassing framework guardrails.

## Repository layout

```text
tests/
  data/                   Centralized URLs, users, thresholds
  pages/                  Page Objects and shared BasePage
  fixtures.ts             Shared Playwright fixtures
  indiaRealtime.spec.ts        Main smoke coverage
  unit-tests/             Fast platform tests
  integration-tests/      Multi-step workflows
  accessibility/          Axe and keyboard checks
  security-tests/         Authentication and XSS checks
  validation-tests/       Broken links and invalid inputs/routes
  network-resilience/     Offline/network scenarios
  contract-tests/         API contract checks
  ...
tools/
  ai-reporter.ts          Structured run output
  platform/               Failure analysis, trace summaries, healing,
                          test selection, metrics, and redaction
mcp-server.ts             MCP/JSON-RPC entrypoint
playwright.config.ts      Browser projects and reporters
```

## Writing tests

Create a Page Object for UI selectors and actions:

```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly url = '/login';

  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto(this.url);
  }

  async submit(username: string) {
    await this.safeFill(this.page.getByLabel('Username'), username, 'username');
  }

  async expectReady() {
    await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
  }
}
```

Keep the spec focused on behavior:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('shows login form', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.expectReady();
});
```

Prefer role, label, and `data-testid` locators. Use Playwright waits and assertions instead of fixed sleeps.

## AI-agent workflow

After a run, AI tools can consume:

- `test-results/ai-report.json` — normalized test status and root-cause hints
- `test-results/results.json` — standard Playwright JSON
- `junit.xml` — CI/JUnit output
- `playwright-report/` — visual HTML report
- `test-results/<test>/trace.zip` — Playwright trace

The MCP server exposes tools for listing specs, running tests, reading results, analyzing failures, generating test previews, selecting impacted tests, and proposing/validating guarded locator repairs.

Start it locally:

```bash
npm run mcp:server
```

For AI-assisted debugging:

1. Run the smallest failing spec.
2. Read `test-results/ai-report.json`.
3. Open the trace or screenshot when available.
4. Update the locator in the relevant `tests/pages/*Page.ts`.
5. Re-run the spec and the smallest related suite.

Healing tools are intentionally POM-only. Applying locator changes may require approval according to risk, and validation should compare the rerun before and after.

### Playwright agents

The repository provides three modern custom agents in `.github/agents/`:

- **playwright-planner**: explores a journey and produces a risk-based test plan.
- **playwright-generator**: converts a plan into POM-aligned Playwright specs.
- **playwright-healer**: reproduces failures and repairs the smallest root cause.

Agent example: select **playwright-generator** and enter:

```text
Generate a deterministic Chromium smoke spec for https://indiarealtime.com.
Verify the homepage, capture accessibility basics, and open the first article.
Put UI locators in tests/pages/IndiaRealTimePage.ts and use tests/data/urls.ts.
Run npm run test:smoke after generation.
```

The same agent workflow supports 2026/2027 maintenance:

1. Plan new journeys and classify regression risk.
2. Generate independent, project-compatible specs.
3. Run focused browser checks in Chromium, Firefox, WebKit, and mobile projects.
4. Heal only reproduced failures and validate the affected suite.
5. Consume the AI report and trace before changing assertions or locators.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `E2E_BASE_URL` | `https://indiarealtime.com` | Base URL for browser and API fixtures |
| `E2E_API_TOKEN` | unset | Optional bearer token for API requests |
| `CI` | unset | Enables CI retries and worker limits |

Authentication and sensitive values should remain in environment variables or CI secrets. The framework redacts secrets in AI report output and healing records.

## Browser and device coverage

The default configuration includes Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), and Mobile Safari (iPhone 12).

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test tests/mobile.spec.ts --project="Mobile Chrome"
npx playwright test tests/mobile.spec.ts --project="Mobile Safari"
```

Install all browsers once with:

```bash
npx playwright install --with-deps
```

## Docker

```bash
docker-compose up --build tests
```

Override the target by updating `docker-compose.yml` or passing `E2E_BASE_URL` in the local environment. Docker output is written to mounted Playwright and test-result directories.

## CI/CD

GitHub Actions runs formatting, unit, integration, smoke, security/audit, and secret-scanning checks. Unit and integration suites remain blocking; extended suites are clearly separated for faster feedback.

CI artifacts include HTML reports, JSON/JUnit results, traces, screenshots, and videos.

## Test coverage areas

- End-to-end smoke flows
- API operations and contract checks
- Authentication and XSS checks
- Accessibility and keyboard behavior
- Broken links, invalid routes, and input validation
- Mobile and internationalization behavior
- Network/offline resilience
- Performance load-time checks
- Interoperability and mock scenarios
- Chaos/concurrency and resource failure checks

## Troubleshooting

| Problem | Fix |
|---|---|
| Browsers missing | `npx playwright install --with-deps` |
| Locator changed | Inspect `test-results/error-context.md` or the trace, then update the POM |
| Target unavailable | Set `E2E_BASE_URL` and verify network/DNS access |
| MCP server unavailable | Run `npm ci && npm run mcp:server` |
| Formatting fails | `npm run format` |
| Type failures | `npm run typecheck` |

Debug a single spec:

```bash
npx playwright test tests/indiaRealtime.spec.ts --project=chromium --headed --debug
npx playwright show-trace test-results/<test-name>/trace.zip
npx playwright show-report
```

## License

MIT. See [LICENSE](LICENSE).
