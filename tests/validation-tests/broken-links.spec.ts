import { test, expect, Page } from '@playwright/test';
import { URLS } from '../data/urls';

test.describe('WeSendCV - Broken Links Validation', () => {
  const baseURL = URLS.wesendcv.base;
  const visitedLinks = new Set<string>();
  const brokenLinks: Array<{ url: string; statusCode: number; context: string }> = [];
  const externalLinks: Array<{ url: string; statusCode: number }> = [];

  /**
   * Normalize URL by removing fragments and query params for deduplication
   */
  function normalizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
    } catch {
      return url;
    }
  }

  /**
   * Check if URL belongs to the same domain
   */
  function isInternalLink(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === new URL(baseURL).hostname;
    } catch {
      return false;
    }
  }

  /**
   * Extract all links from current page
   */
  async function extractLinks(page: Page): Promise<string[]> {
    const links = await page.locator('a[href]').all();
    const hrefs: string[] = [];

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href) {
        // Skip anchor-only links, javascript, mailto, tel, etc.
        if (
          !href.startsWith('#') &&
          !href.startsWith('javascript:') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') &&
          !href.startsWith('sms:')
        ) {
          // Convert relative URLs to absolute
          const absoluteUrl =
            href.startsWith('http') || href.startsWith('//') ? href : `${baseURL}${href}`;
          hrefs.push(absoluteUrl);
        }
      }
    }
    return hrefs;
  }

  /**
   * Check link status via HEAD or GET request
   */
  async function checkLinkStatus(
    page: Page,
    url: string
  ): Promise<{ statusCode: number; valid: boolean }> {
    try {
      // Try HEAD request first (faster)
      let response = await page.request.head(url, { timeout: 10000 }).catch(() => null);

      // If HEAD fails, try GET
      if (!response || response.status() === 405) {
        response = await page.request.get(url, { timeout: 10000 });
      }

      const statusCode = response?.status() || 0;
      const valid = statusCode >= 200 && statusCode < 400;

      return { statusCode, valid };
    } catch (error) {
      return { statusCode: 0, valid: false };
    }
  }

  test('should not have broken internal links', async ({ page }) => {
    const pagesToCrawl: string[] = [baseURL];
    const crawledPages = new Set<string>();

    // Crawl up to 20 pages to find all links
    while (pagesToCrawl.length > 0 && crawledPages.size < 20) {
      const currentPage = pagesToCrawl.shift()!;
      const normalized = normalizeUrl(currentPage);

      if (crawledPages.has(normalized)) continue;
      crawledPages.add(normalized);

      try {
        await page.goto(currentPage, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const links = await extractLinks(page);

        for (const link of links) {
          const normalizedLink = normalizeUrl(link);

          if (!visitedLinks.has(normalizedLink)) {
            visitedLinks.add(normalizedLink);

            if (isInternalLink(link)) {
              // Check internal link status
              const { statusCode, valid } = await checkLinkStatus(page, link);

              if (!valid) {
                brokenLinks.push({
                  url: link,
                  statusCode,
                  context: currentPage,
                });
              }

              // Add to crawl queue if it's an internal link and we haven't reached the limit
              if (crawledPages.size < 20 && !crawledPages.has(normalizedLink)) {
                pagesToCrawl.push(link);
              }
            } else {
              // Check external link status (sample check)
              const { statusCode, valid } = await checkLinkStatus(page, link);
              if (!valid) {
                externalLinks.push({ url: link, statusCode });
              }
            }
          }
        }
      } catch (error) {
        console.log(`Could not crawl page: ${currentPage}`);
      }
    }

    // Report results
    console.log(`\n📊 Link Validation Report:`);
    console.log(`   ✅ Pages crawled: ${crawledPages.size}`);
    console.log(`   🔗 Unique links checked: ${visitedLinks.size}`);
    console.log(`   ❌ Broken internal links: ${brokenLinks.length}`);
    console.log(`   ⚠️  Unreachable external links: ${externalLinks.length}`);

    if (brokenLinks.length > 0) {
      console.log(`\n🔴 Broken Links Found:`);
      brokenLinks.forEach(({ url, statusCode, context }) => {
        console.log(`   • ${url} (Status: ${statusCode}) - Found on: ${context}`);
      });
    }

    if (externalLinks.length > 0) {
      console.log(`\n🟡 Unreachable External Links:`);
      externalLinks.slice(0, 5).forEach(({ url, statusCode }) => {
        console.log(`   • ${url} (Status: ${statusCode})`);
      });
    }

    // Assert no broken internal links
    expect(brokenLinks).toHaveLength(0);
  });

  test('should have valid homepage', async ({ page }) => {
    const response = await page.goto(baseURL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response?.status()).toBeLessThan(400);
    expect(response?.ok()).toBeTruthy();

    // Verify main content is present
    await expect(page.locator('body')).toBeVisible();
  });

  test('should return 404 for invalid paths', async ({ page }) => {
    const invalidPath = '/this-page-does-not-exist-12345';
    const response = await page.goto(`${baseURL}${invalidPath}`, {
      waitUntil: 'domcontentloaded',
    });

    expect(response?.status()).toBe(404);
  });
});
