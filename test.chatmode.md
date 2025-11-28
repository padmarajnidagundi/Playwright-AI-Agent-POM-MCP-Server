cat > planner.chatmode.md <<'EOF'
# planner.chatmode.md — Checkout Flow Test Plan (saucedemo.com)

## Executive summary
This test plan validates the end-to-end checkout flow on https://www.saucedemo.com: login → add to cart → cart → Checkout: Your Information → Checkout: Overview → Checkout: Complete. It covers happy paths, negative/edge cases, validation, totals arithmetic, UI/responsive behavior, accessibility basics, and cross-browser sanity checks. Each scenario assumes a blank/fresh browser state unless stated.

## Scope
- Pages: Inventory (Products), Cart, Checkout: Your Information, Checkout: Overview, Checkout: Complete
- Primary user: `standard_user` / `secret_sauce`
- Negative users: `locked_out_user`, `problem_user`
- Platforms: Desktop (Chrome, Firefox, Safari) and mobile viewports (emulated)
- Excluded: real payment gateway (demo site uses static completion page)

## Assumptions & prerequisites
- Fresh browser context per scenario (clear cookies/localStorage)
- Test accounts available locally: `standard_user`, `locked_out_user`, `problem_user`
- Network access to public demo
- Known product examples: Sauce Labs Backpack, Bike Light, Bolt T-Shirt

## Test data
- Users: `standard_user / secret_sauce`, `locked_out_user / secret_sauce`
- Sample inputs: valid names/postal codes, blank values, very long strings (>=1024 chars), script-like payloads

## Success criteria
- All High-priority scenarios pass (happy path, validation, price math, locked-out handling)
- No showstoppers preventing checkout for `standard_user`
- No critical accessibility violations on checkout pages

## Execution notes
- Clear storage between tests or use isolated browser contexts
- Capture screenshots and console/network logs on failure
- Automation candidates: TC-01, TC-02, TC-05, TC-09, TC-07 (recommend Playwright)

## Test scenarios

Each scenario includes: Assumptions (start state), Step-by-step actions, Expected results, Success/failure criteria.

### TC-01 — Happy path (single item) — High
Assumptions: fresh browser, logged out.
Steps:
1. Open https://www.saucedemo.com
2. Login: `standard_user` / `secret_sauce`
3. Add "Sauce Labs Backpack" to cart
4. Click cart → Click "Checkout"
5. Enter First: "Alex", Last: "Test", Postal: "90210"
6. Click "Continue" → On Overview click "Finish"
Expected:
- Overview lists the product with correct price
- Item total equals product price; tax and total present per site calculation
- Completion page displays confirmation (e.g., "THANK YOU FOR YOUR ORDER")
Success: completion page reached and totals arithmetic correct.

### TC-02 — Happy path (multiple items & totals) — High
Assumptions: fresh browser.
Steps:
1. Login as `standard_user`
2. Add three different products
3. Proceed to cart → Checkout → Provide valid info → Continue → Finish
Expected:
- All items appear in Overview
- Item total = sum(product prices) with correct rounding
- Final total = item total + tax (matches displayed tax)
Success: totals accurate and all items present.

### TC-03 — Remove item from cart — Medium
Assumptions: items added to cart.
Steps:
1. Add two items
2. Open Cart → Click "Remove" on one item
Expected:
- Item removed, cart count updated, totals reflect removal
Failure: removed item still shown or totals unchanged.

### TC-04 — Cart persistence across navigation — Medium
Assumptions: fresh browser.
Steps:
1. Add an item from Products
2. Navigate away (product details or inventory), return to Cart
Expected:
- Cart retains items in current session.

### TC-05 — Required-field validation (Checkout: Your Information) — High
Assumptions: at Checkout: Your Information.
Steps:
1. Leave First Name blank, fill others → Click Continue
2. Repeat leaving Last Name blank, then Postal blank
Expected:
- Inline/form validation prevents Continue and shows clear error messages.

### TC-06 — Malicious / very long input handling — High
Assumptions: Checkout form visible.
Steps:
1. Input a 1024+ char string or script-like string into fields
2. Click Continue
Expected:
- Input treated as text (no script execution), no client crash, either accepted as plain text or validation rejects with message.

### TC-07 — Locked-out user login blocked — High
Assumptions: fresh browser.
Steps:
1. Attempt login: `locked_out_user / secret_sauce`
Expected:
- Login denied with explicit locked-out message; no access to inventory/cart/checkout.

### TC-08 — Problem user behavior logging — Medium
Assumptions: `problem_user` available.
Steps:
1. Login as `problem_user`
2. Attempt to add items and checkout
Expected:
- Observe and document known demo anomalies (broken images, ordering issues) and log defects.

### TC-09 — Price arithmetic and rounding — High
Assumptions: items with prices that can create rounding edge cases.
Steps:
1. Add selected items (e.g., $7.99 + $9.99)
2. Open Overview and verify item total, tax, and grand total
Expected:
- Arithmetic correct to two decimal places; tax consistent with displayed rate.

### TC-10 — Back / Cancel behavior during checkout — Medium
Assumptions: mid-checkout (Overview).
Steps:
1. Click browser Back or on-page "Cancel"
Expected:
- Navigation returns to Cart or Inventory per design and cart state preserved as specified.

### TC-11 — Deep-link protection for Overview — Medium
Assumptions: not completed Checkout: Your Information.
Steps:
1. Try to open Overview URL directly
Expected:
- App redirects to Checkout: Your Information or Cart; cannot bypass required steps.

### TC-12 — Session expiration mid-checkout — High
Assumptions: logged-in user mid-checkout.
Steps:
1. Begin checkout → Clear cookies/localStorage or wait session expiry
2. Attempt Continue/Finish
Expected:
- App prompts for login or shows session-expired behavior; no silent failures.

### TC-13 — Concurrency/cart update conflict — Low
Assumptions: same account in two sessions.
Steps:
1. Add/remove items concurrently from Session A and B
2. Proceed to checkout in both
Expected:
- Deterministic resolution; no data corruption.

### TC-14 — Responsive layout checks — Medium
Assumptions: various viewports.
Steps:
1. Run core flow at desktop, tablet, and mobile widths
Expected:
- Inputs and buttons visible and usable; no layout overlaps.

### TC-15 — Keyboard navigation & focus order — Medium
Assumptions: Checkout form accessible.
Steps:
1. Tab through inputs and buttons; activate with Enter/Space
Expected:
- Logical focus order; visible focus and keyboard operation.

### TC-16 — Accessibility audit (axe) — Medium
Assumptions: run axe or similar.
Steps:
1. Run automated audit on Your Information, Overview, Complete pages
Expected:
- No critical A/AA issues blocking checkout; inputs labeled correctly.

### TC-17 — Cross-browser sanity (Chrome/Firefox/Safari) — High
Assumptions: latest stable browsers.
Steps:
1. Run TC-01 and TC-02 in each browser
Expected:
- Consistent functional behavior and totals.

### TC-18 — Mobile browser checks (iOS/Android) — Medium
Assumptions: emulator or real device.
Steps:
1. Run TC-01 on mobile browsers
Expected:
- Checkout usable and completion reachable.

### TC-19 — Small-scale performance smoke — Low
Assumptions: load runner available.
Steps:
1. Simulate ~10 concurrent users performing add-to-cart → checkout
Expected:
- No server errors; acceptable response times.

### TC-20 — Logout during checkout — Medium
Assumptions: logged-in mid-checkout.
Steps:
1. Click logout or clear session
Expected:
- Redirect to login; cart behavior follows spec (persisted or cleared).

## Defect report template
- Title
- Environment (URL, browser/version, OS)
- Steps to reproduce
- Actual result
- Expected result
- Test data
- Attachments (screenshots, logs)
- Severity / Priority

## Automation candidates (priority)
1. TC-01 (single-item happy path)
2. TC-02 (multi-item totals)
3. TC-05 (required-field validation)
4. TC-09 (price arithmetic)
5. TC-07 (locked-out login)
6. TC-17 (cross-browser sanity runs)

## Exit criteria
- All High-priority tests pass
- No showstoppers preventing checkout for `standard_user`
- Automation added for core happy path & validations (optional CI integration)

## Notes & risks
- `problem_user` may show intentional demo anomalies — document expected vs actual.
- Demo environment resets or shared public state may cause flakiness; tests should isolate state.
EOF