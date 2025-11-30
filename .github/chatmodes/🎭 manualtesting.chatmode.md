---
name: Manual Testing
description: Assist with manual test planning and execution.
examples:
  - "How do I manually verify login flow?"
  - "Checklist for UI regression testing"
---

# Manual Testing Instructions — WeSendCV

## Overview
This chatmode provides step-by-step manual testing guidance for **https://wesendcv.com**, aligned with the Playwright Page Object Model test suite.

## Pre-requisites
- Browser: Chrome, Firefox, or Edge (latest version)
- Network: Stable internet connection
- Environment: Use staging or production as directed

## Test Scenarios

### 1. Landing Page Verification
**URL:** https://wesendcv.com  
**Steps:**
1. Navigate to the site
2. Verify the page loads within 3 seconds
3. Check that the header, hero section, and CTA buttons are visible
4. Confirm no JavaScript errors in browser console (F12 → Console)
5. Validate responsive design (resize to mobile 375px width)

**Expected Result:** Page renders cleanly with all elements visible and interactive.

---

### 2. Navigation & Menu
**Steps:**
1. Inspect main navigation menu
2. Hover over menu items (if applicable)
3. Click each link and verify correct page load
4. Test back button behavior

**Expected Result:** All navigation items respond correctly; no broken links.

---

### 3. Form Submission (if applicable)
**Steps:**
1. Locate any contact or upload form
2. Fill in required fields with valid test data
3. Submit the form
4. Verify success message or redirect

**Expected Result:** Form submits and user receives confirmation.

---

### 4. Visual & Performance Check
**Steps:**
1. Take a screenshot of key page sections
2. Check for visual alignment, spacing, and typography
3. Open DevTools → Lighthouse and run performance audit
4. Note any warnings or errors

**Expected Result:** Page layout is clean; performance score ≥ 75 for desktop.

---

### 5. Accessibility Check
**Steps:**
1. Press Tab repeatedly to navigate via keyboard
2. Use a screen reader (NVDA on Windows, VoiceOver on Mac) to verify headings
3. Check color contrast using a tool like WebAIM

**Expected Result:** Page is keyboard navigable and screen-reader friendly.

---

## Known Issues & Notes
- Document any issues found with reproducible steps
- Include browser and OS version
- Attach screenshots if applicable

## Automation Reference
For automated versions of these tests, see:
- `tests/pages/WeSendCVPage.ts` (Page Object)
- `tests/wesendcv.spec.ts` (Test Suite)
- `tests/data/urls.ts` (Centralized URLs and constants)

Run automated tests:
```powershell
npx playwright test tests/wesendcv.spec.ts --project=chromium --headed
```

---

**Last Updated:** $(date)  
**Owner:** QA / Playwright Team
