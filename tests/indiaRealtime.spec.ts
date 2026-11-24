import { test, expect } from '@playwright/test';
import { IndiaRealTimePage } from './pages/IndiaRealTimePage';
import { URLS } from './data/urls';

test.describe('IndiaRealTime smoke checks', () => {
  let indiaRealtimePage: IndiaRealTimePage;

  test.beforeEach(async ({ page }) => {
    indiaRealtimePage = new IndiaRealTimePage(page);
  });

  test('homepage loads, title and main visible, save screenshot', async ({}, testInfo) => {
    // Navigate to homepage
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify title exists
    const title = await indiaRealtimePage.getPageTitle();
    expect(title.length).toBeGreaterThan(0);

    // Verify homepage content is visible
    await indiaRealtimePage.verifyHomepageLoaded();

    // Save screenshot
    const shot = testInfo.outputPath('indiaRealtime-home.png');
    await indiaRealtimePage.takeScreenshot(shot);
  });

  test('invalid page returns 404 error', async () => {
    // Navigate to invalid page
    const resp = await indiaRealtimePage.gotoInvalidPage(
      URLS.indiaRealtime.invalidPage
    );
    expect(resp && resp.status()).toBe(404);

    // Verify 404 error is displayed (graceful fallback)
    await indiaRealtimePage.verify404ErrorDisplayed();
  });
  test('can click first job link and navigate to job details', async () => {
    // Navigate to homepage
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Click the first job link
    await indiaRealtimePage.clickFirstJobLink();

    // Wait for navigation and check that the URL changed from the homepage
    await expect(indiaRealtimePage.page).not.toHaveURL(URLS.indiaRealtime.home);

    // Optionally, check that the main content is still visible
    await indiaRealtimePage.verifyHomepageLoaded();
  });

  test('homepage URL matches configured home URL', async () => {
    // Navigate to homepage
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify canonical homepage URL
    await expect(indiaRealtimePage.page).toHaveURL(URLS.indiaRealtime.home);
  });

  test('homepage contains at least one job listing link', async () => {
    // Navigate to homepage
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify at least one job listing entry exists in the page
    await indiaRealtimePage.verifyJobLinksExist();
  });

  test('first job listing link has a usable href', async () => {
    // Navigate to homepage
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Ensure job links exist before checking first link attributes
    await indiaRealtimePage.verifyJobLinksExist();

    // Verify first link href is present and not a placeholder
    const href = await indiaRealtimePage.firstJobLink.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).not.toBe('#');
  });

  test('homepage title contains the IndiaRealTime brand name', async () => {
    // Navigate to homepage
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp && resp.ok()).toBeTruthy();

    // Verify homepage title references the site brand
    const title = await indiaRealtimePage.getPageTitle();
    expect(title).toMatch(/india.*real.*time|indiarealtime/i);
  });
});
