import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { WeSendCVPage } from '../pages/WeSendCVPage';

Here are helpful comments you can add to the accessibility test code:

```javascript
test('WeSendCV page should have no detectable a11y violations', async ({
  page,
}) => {
  const weSend = new WeSendCVPage(page);
  await weSend.gotoHomepage();

  // ARIA & ACCESSIBILITY TESTING
  // ---------------------------
  // This test uses axe-core through axe-playwright to detect WCAG violations
  // 
  // Important notes:
  // 1. Ensure `axe-playwright` is installed: `npm i -D axe-playwright`
  // 2. This tests for automated violations only - manual testing still required
  // 3. Violations are categorized by impact: critical, serious, moderate, minor
  // 4. Some violations may need to be suppressed with exceptions if they're false positives
  //    or accepted design decisions (use `axeOptions` parameter for this)
  //
  // Common violations to watch for:
  // - Missing alt text on images
  // - Insufficient color contrast
  // - Missing form labels
  // - Keyboard navigation issues
  // - Missing ARIA attributes
  // - Improper heading hierarchy
  
  // Inject axe-core accessibility engine into the page
  await injectAxe(page);
  
  // Run accessibility checks on the entire page
  // Parameters:
  // 1. page - The Playwright page object
  // 2. selector (undefined) - Check entire page, or specify a selector for partial testing
  // 3. options - Configuration for reporting and test behavior
  await checkA11y(page, undefined, {
    detailedReport: true, // Generates detailed console output
    detailedReportOptions: { html: true }, // Includes HTML snippets in reports
    // Additional options you might consider:
    // axeOptions: { rules: { 'color-contrast': { enabled: false } } }, // Disable specific rules
    // exclude: '.third-party-widget', // Exclude problematic elements
  });
  
  // POST-TEST CONSIDERATIONS:
  // 1. Check terminal output for violation details
  // 2. Fix critical and serious violations immediately
  // 3. Document reasons for any suppressed violations
  // 4. Consider adding specific tests for keyboard navigation and screen readers
});
```

You might also want to add a comment at the top of your test file:

```javascript
/**
 * ACCESSIBILITY TESTING STRATEGY
 * 
 * We use axe-core for automated accessibility testing to catch common WCAG violations.
 * 
 * Limitations:
 * - Automated tests catch ~30-40% of accessibility issues
 * - Manual testing with screen readers and keyboard navigation is still essential
 * - Color contrast and visual focus indicators should be manually verified
 * 
 * Integration:
 * - Runs as part of CI/CD pipeline
 * - Fail on critical/serious violations
 * - Warn on moderate/minor violations (configurable)
 * 
 * Reference: https://dequeuniversity.com/rules/axe/
 */
```
test('WeSendCV page should have no detectable a11y violations', async ({
  page,
}) => {
  const weSend = new WeSendCVPage(page);
  await weSend.gotoHomepage();

  // Inject axe and run accessibility checks. Add `axe-playwright` as a dev dependency if missing.
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
