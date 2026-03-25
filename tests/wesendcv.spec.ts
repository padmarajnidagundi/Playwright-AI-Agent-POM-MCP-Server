import { test, expect } from '@playwright/test';
import { WeSendCVPage } from './pages/WeSendCVPage';
import { URLS } from './data/urls';

test.describe('WeSendCV smoke checks', () => {
  let wesendcvPage: WeSendCVPage;

  test.beforeEach(async ({ page }) => {
    wesendcvPage = new WeSendCVPage(page);
  });

  test('homepage loads, title and main visible, save screenshot', async ({}, testInfo) => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify title exists
    const title = await wesendcvPage.getPageTitle();
    expect(title.length).toBeGreaterThan(0);

    // Verify homepage content is visible
    await wesendcvPage.verifyHomepageLoaded();

    // Save screenshot
    const shot = testInfo.outputPath('wesendcv-home.png');
    await wesendcvPage.takeScreenshot(shot);
  });

  test('invalid page returns 404 error', async () => {
    // Navigate to invalid page
    const resp = await wesendcvPage.gotoInvalidPage(URLS.wesendcv.invalidPage);
    expect(resp && resp.status()).toBe(404);

    // Verify 404 error is displayed (graceful fallback)
    await wesendcvPage.verify404ErrorDisplayed();
  });
  test('can click first job link and navigate to job details', async () => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Click the first job link
    await wesendcvPage.clickFirstJobLink();

    // Wait for navigation and check that the URL changed from the homepage
    await expect(wesendcvPage.page).not.toHaveURL(URLS.wesendcv.home);

    // Optionally, check that the main content is still visible
    await wesendcvPage.verifyHomepageLoaded();
  });

  test('homepage URL matches configured home URL', async () => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify canonical homepage URL
    await expect(wesendcvPage.page).toHaveURL(URLS.wesendcv.home);
  });

  test('homepage contains at least one job listing link', async () => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify at least one job listing entry exists in the page
    await wesendcvPage.verifyJobLinksExist();
  });

  test('first job listing link has a usable href', async () => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Ensure job links exist before checking first link attributes
    await wesendcvPage.verifyJobLinksExist();

    // Verify first link href is present and not a placeholder
    const href = await wesendcvPage.firstJobLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).not.toBe('#');
  });

  test('homepage title contains the WeSendCV brand name', async () => {
    // Navigate to homepage
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify homepage title references the site brand
    const title = await wesendcvPage.getPageTitle();
    expect(title).toMatch(/wesendcv/i);
  });
});
