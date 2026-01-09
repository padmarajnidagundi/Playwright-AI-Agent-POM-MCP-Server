import { test, expect } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';
import { URLS } from '../data/urls';

test.describe('Response Code Tests', () => {
  let wesendcvPage: WeSendCVPage;

  test.beforeEach(async ({ page }) => {
    wesendcvPage = new WeSendCVPage(page);
  });

  test('homepage returns 200 OK', async () => {
    const resp = await wesendcvPage.gotoHomepage();
    expect(resp?.status()).toBe(200);
  });

  test('invalid page returns 404 Not Found', async () => {
    const resp = await wesendcvPage.gotoInvalidPage(URLS.wesendcv.invalidPage);
    expect(resp?.status()).toBe(404);
  });
});
