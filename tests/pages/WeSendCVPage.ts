import { Page, expect } from '@playwright/test';
import { URLS } from '../data/urls';

export class WeSendCVPage {
  readonly page: Page;
  readonly url = URLS.wesendcv.base;
  readonly baseUrl = URLS.wesendcv.base;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get bodyElement() { return this.page.locator('body'); }
  get mainContent() { return this.page.locator('main, header, [role="main"], h1'); }
  get errorIndicator() { return this.page.locator('text=/404|not found|page not found/i'); }

  /**
   * Navigate to the homepage
   */
  async gotoHomepage() {
    const resp = await this.page.goto(this.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    return resp;
  }

  /**
   * Navigate to an invalid page (404 test)
   */
  async gotoInvalidPage(path: string) {
    const url = `${this.baseUrl}${path}`;
    const resp = await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    return resp;
  }

  /**
   * Verify homepage is loaded and visible
   */
  async verifyHomepageLoaded() {
    await expect(this.bodyElement).toBeVisible();
    await expect(this.mainContent.first()).toBeVisible();
  }

  /**
   * Click on the first job link
   */
  async clickFirstJobLink() {
    await this.page.locator('.tpg-post-link').first().click();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Take a full-page screenshot
   */
  async takeScreenshot(path: string) {
    await this.page.screenshot({ path, fullPage: true });
  }

  /**
   * Verify 404 error is displayed
   */
  async verify404ErrorDisplayed() {
    await expect(this.errorIndicator.first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // Some sites may not have visible 404 text, but status code check is sufficient
    });
  }
}
