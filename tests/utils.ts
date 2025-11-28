// helpers & small utilities
export function parseCurrency(text: string) {
  // robustly parse currency, strip non-numeric except dot and minus
  const cleaned = (text || '').replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned || '0');
}

export async function waitForNavigationIfNeeded(page, action: () => Promise<void>) {
  // use Playwright built-in waitWhen navigation may or may not occur
  await Promise.all([action(), page.waitForLoadState('load')]);
}