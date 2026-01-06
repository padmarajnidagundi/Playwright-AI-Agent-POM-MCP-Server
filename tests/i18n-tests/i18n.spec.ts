import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('WeSendCV page has correct language attributes and basic translations', async ({
  page,
}) => {
  const weSend = new WeSendCVPage(page);
  await weSend.gotoHomepage();

  // Check that the document has a lang attribute (e.g., 'en' for English)
  const lang = await page.getAttribute('html', 'lang');
  expect(lang).toBe('en-US'); // Site uses 'en-US'

  // Verify some key text is present (basic translation check)
  await expect(page.locator('text=/We Send Your Resume/i')).toBeVisible();

  // If the site supports multiple languages, you could add URL param tests here
  // e.g., await page.goto('https://wesendcv.com?lang=es'); and check Spanish text
});
