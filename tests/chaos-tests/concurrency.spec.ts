import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('simulate concurrent users accessing homepage', async ({ browser }) => {
  // Create multiple contexts to simulate concurrent users
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);

  // Create pages for each context
  const pages = await Promise.all(contexts.map((ctx) => ctx.newPage()));

  // Simulate concurrent navigation
  const navigations = pages.map(async (page) => {
    const weSend = new WeSendCVPage(page);
    await weSend.gotoHomepage();
    await weSend.verifyHomepageLoaded();
    return page.title();
  });

  // Wait for all to complete
  const titles = await Promise.all(navigations);
  titles.forEach((title) => expect(title).toContain('WeSendCV'));

  // Clean up
  await Promise.all(contexts.map((ctx) => ctx.close()));
});
