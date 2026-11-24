import { test, expect } from '@playwright/test';
import { IndiaRealTimePage } from '../pages/IndiaRealTimePage';
import { URLS } from '../data/urls';

test.describe('Response Code Tests', () => {
  let indiaRealtimePage: IndiaRealTimePage;

  test.beforeEach(async ({ page }) => {
    indiaRealtimePage = new IndiaRealTimePage(page);
  });

  test('homepage returns 200 OK', async () => {
    const resp = await indiaRealtimePage.gotoHomepage();
    expect(resp?.status()).toBe(200);
  });

  test('invalid page returns 404 Not Found', async () => {
    const resp = await indiaRealtimePage.gotoInvalidPage(
      URLS.indiaRealtime.invalidPage
    );
    expect(resp?.status()).toBe(404);
  });

  test('API posts endpoint returns 200 OK', async ({ request }) => {
    const resp = await request.get(URLS.indiaRealtime.api.posts);
    expect(resp.status()).toBe(200);
  });
});
