---
name: playwright-test-debugging
description: Guide for debugging failing Playwright tests using Page Object Model patterns. Use this when asked to debug failing tests, investigate test failures, or analyze test results.
---

# Playwright Test Debugging Skill

When debugging failing Playwright tests in this repository, follow this systematic process:

## 1. Gather Test Results

- Check `test-results/results.json` for structured test output
- Review `junit.xml` for test execution summary
- Open the HTML report with `npx playwright show-report` or check `playwright-report/index.html`
- Look for error context files in `test-results/` subdirectories (e.g., `error-context.md`)

## 2. Identify the Failure Type

**Locator/Selector Issues:**
- Check if selectors in Page Object files (`tests/pages/*.ts`) are still valid
- Verify the target application hasn't changed its DOM structure
- Use `page.pause()` or `--debug` flag to inspect elements interactively

**Timing/Synchronization Issues:**
- Look for race conditions or inadequate waits
- Replace any `setTimeout` with Playwright's auto-waiting locators
- Use `waitForSelector`, `waitForLoadState`, or `expect(locator).toBeVisible()`

**Visual Regression Failures:**
- Run `node tools/compare.js` to regenerate visual diffs
- Check if baseline images in `demo/baseline.png` need updating
- Verify threshold settings in the comparison (default 0.03)

**Network/API Issues:**
- Check mock configurations in `tests/mock-tests/`
- Verify API contracts in `tests/contract-tests/`
- Use `page.waitForResponse()` to ensure API calls complete

**Page Object Issues:**
- Verify page object methods in `tests/pages/` follow single-purpose pattern
- Ensure centralized data from `tests/data/` is imported correctly
- Check that actions and assertions are properly separated

## 3. Reproduce Locally

Run the specific failing test in headed mode to see what's happening:

```powershell
npx playwright test tests/<failing-test>.spec.ts --project=chromium --headed --debug
```

For a specific test case:

```powershell
npx playwright test tests/<failing-test>.spec.ts -g "test name pattern" --headed
```

## 4. Collect Diagnostic Artifacts

If the test fails locally:
- Screenshots are in `test-results/<test-name>/`
- Videos (if enabled) are also in test results
- Traces can be viewed with `npx playwright show-trace trace.zip`

## 5. Fix Following Repository Patterns

**Update Page Objects (not test files):**
- Edit selectors only in `tests/pages/*Page.ts` files
- Keep methods small and single-purpose
- Add proper waits in page object methods

**Update Test Data:**
- Modify URLs in `tests/data/urls.ts`
- Update user credentials in `tests/data/users.ts`
- Never hardcode data in test files

**Maintain Test Categories:**
- Keep tests in their category folders under `tests/`
- Follow existing patterns for test organization
- Ensure new tests fit the established structure

## 6. Verify the Fix

Run the test suite to ensure no regressions:

```powershell
npm test
```

Or run just the fixed test:

```powershell
npx playwright test tests/<fixed-test>.spec.ts
```

## 7. Update Baselines (if needed)

For visual regression tests:
1. Start the demo server: `node tools/dev-server.js`
2. Capture new baseline: use browser or screenshot tool
3. Compare: `node tools/compare.js demo/baseline.png artifacts/current.png artifacts/diff.png --threshold=0.03`
4. If approved, commit the new baseline image with explanation

## Common Debugging Commands

```powershell
# Run with UI mode for interactive debugging
npx playwright test --ui

# Run with trace
npx playwright test --trace on

# Show trace viewer
npx playwright show-trace trace.zip

# Generate missing screenshots
npx playwright test --update-snapshots

# Run specific project
npx playwright test --project=webkit

# Show last HTML report
npx playwright show-report
```

## Integration with MCP/Chatmode

If MCP server is available, you can use programmatic debugging:
- Check `.vscode/mcp.json` for MCP configuration
- Review `.github/chatmodes/🎭 healer.chatmode.md` for healing patterns
- Use MCP commands if `npx playwright run-test-mcp-server` is available

## Anti-Patterns to Avoid

❌ Don't use `page.waitForTimeout()` - use auto-waiting locators instead
❌ Don't put selectors directly in test files - use Page Objects
❌ Don't hardcode URLs or data - use `tests/data/` modules
❌ Don't update baselines without visual approval and documentation
❌ Don't skip tests without documenting why in the test file
❌ Don't make sweeping refactors across multiple test categories at once

## Quick Checklist

- [ ] Checked test results in `test-results/results.json` or HTML report
- [ ] Identified failure type (selector, timing, visual, network, etc.)
- [ ] Reproduced failure locally with `--headed --debug`
- [ ] Located relevant Page Object file in `tests/pages/`
- [ ] Verified test data in `tests/data/`
- [ ] Applied fix following repository patterns
- [ ] Ran full test suite to check for regressions
- [ ] Updated baselines if needed (with explanation)
- [ ] Documented any configuration changes in PR description
