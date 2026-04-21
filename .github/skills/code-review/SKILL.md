---
name: code-review
description: Reviews Playwright test code for POM compliance, best practices, security, and coverage completeness. Auto-loaded when the user asks to review, audit, or inspect test files.
---

# Playwright Code Review Skill

When reviewing Playwright test code in this repository, apply the following structured checklist and produce a severity-ranked report.

## Artifact Locations

- Spec files: `tests/**/*.spec.ts`
- Page Objects: `tests/pages/*.ts`
- Test data: `tests/data/urls.ts`, `tests/data/users.ts`
- Configuration: `playwright.config.ts`
- Results: `test-results/results.json`, `junit.xml`, `playwright-report/`

---

## 1. POM Compliance

| Rule | Pass Condition |
|------|---------------|
| No raw selectors in `*.spec.ts` | All CSS/XPath/text selectors live in `tests/pages/*.ts` only |
| Single-purpose page methods | Each Page Object method performs exactly one action |
| Centralised test data | URLs and users imported from `tests/data/` — not hardcoded in specs or page objects |
| Constructor pattern | Page Objects accept `Page` via constructor and store as `readonly page: Page` |

**How to fix selector leakage:**
1. Move the selector string to the relevant `tests/pages/*.ts` as a `private readonly` locator property
2. Add a method that uses it
3. Replace the inline selector in the spec with the page object method call

---

## 2. Playwright Best Practices

| Anti-pattern | Replacement |
|---|---|
| `page.waitForTimeout(n)` | `await expect(locator).toBeVisible()` or `waitForResponse` |
| `page.waitForNavigation()` without `waitUntil` | `page.waitForLoadState('domcontentloaded')` |
| Positional XPath (`//div[3]/span`) | `page.getByRole()`, `page.getByLabel()`, or `data-test` attribute |
| `networkidle` in flaky contexts | `waitForResponse` or `waitForLoadState('load')` |
| Shared state between tests | Use `test.beforeEach` with fresh `page` context; avoid module-level state |
| No `test.describe` grouping | Wrap related tests in `test.describe('Feature', () => { ... })` |

---

## 3. Security (OWASP Top 10 aligned)

- **A02 Cryptographic Failures:** No passwords, tokens, or API keys hardcoded in any file — use `process.env.VAR` or placeholder values in `tests/data/users.ts`
- **A03 Injection:** XSS test payloads must use clearly non-functional strings (e.g. `<script>alert(1)</script>` for detection tests only — never working exploits)
- **A07 Auth Failures:** Auth tests must not log or persist sensitive session data to stdout or test artifacts
- **A09 Logging Failures:** No `console.log(password)` or similar in test helpers or page objects

---

## 4. Coverage Completeness

- Every positive (happy-path) test should have a paired negative (error/edge) scenario
- UI-critical pages should have a corresponding entry in `tests/accessibility/a11y.spec.ts`
- Performance-sensitive pages should appear in `tests/performance-tests/load-time.spec.ts`
- Network-dependent flows should have a mock counterpart in `tests/mock-tests/`

---

## 5. Report Output Format

Produce findings in this table, sorted by severity:

```
| Severity | File | Issue | Recommendation |
|----------|------|-------|----------------|
| 🔴 Critical | tests/foo.spec.ts:L12 | Selector hardcoded in spec | Move to FooPage.ts |
| 🟡 Warning  | tests/pages/FooPage.ts:L8 | waitForTimeout(3000) | Replace with expect(locator).toBeVisible() |
| 🔵 Suggestion | tests/foo.spec.ts | No negative test | Add error-path scenario |
```

Severity guide:
- **🔴 Critical** — blocks merge; violates POM contract or security rules
- **🟡 Warning** — degrades reliability or maintainability; should be fixed
- **🔵 Suggestion** — improves coverage or readability; nice to have

---

## PowerShell commands for local validation

```powershell
# Run only the reviewed file to confirm no regressions
npx playwright test tests/<file>.spec.ts --project=chromium

# Run with trace on failure to inspect selector issues
npx playwright test tests/<file>.spec.ts --project=chromium --trace on

# Open the HTML report
npx playwright show-report
```
