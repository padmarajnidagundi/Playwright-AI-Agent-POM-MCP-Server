import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { WeSendCVPage } from '../pages/WeSendCVPage';

test('WeSendCV page should have no detectable a11y violations', async ({
  page,
}) => {
  const weSend = new WeSendCVPage(page);
  await weSend.gotoHomepage();

  // Inject axe and run accessibility checks. Add `axe-playwright` as a dev dependency if missing.
  await injectAxe(page);
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
