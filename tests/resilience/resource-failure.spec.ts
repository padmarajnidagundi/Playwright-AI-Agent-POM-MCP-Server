import { test } from '@playwright/test';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('page still loads when image or stylesheet assets fail', async ({ page }) => {
  // Simulate asset failures (images, svgs, css) to validate resilience
  await page.route('**/*.{png,jpg,jpeg,svg,css}', route =>
    route.fulfill({ status: 500, body: 'asset error' })
  );

  const weSend = new WeSendCVPage(page);
  await weSend.gotoHomepage();

  // The POM verifies main content/body visibility
  await weSend.verifyHomepageLoaded();
});
