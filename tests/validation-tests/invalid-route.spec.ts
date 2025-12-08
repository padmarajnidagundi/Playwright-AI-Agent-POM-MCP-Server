import { test, expect } from '@playwright/test';
import { URLS } from '../data/urls';

test.describe('Negative tests - invalid routes', () => {
	test('non-existent path should return 404 or show Not Found', async ({ page }) => {
		const target = `${URLS.demo.base}${URLS.demo.invalidPage}`;
		const resp = await page.goto(target);

		// If server returns a network response, assert 404 status.
		if (resp && resp.status() !== 200) {
			expect(resp.status()).toBe(404);
			return;
		}

		// Some dev servers / SPAs return 200 and render a client-side "Not Found" message.
		// Check for common text markers instead of relying solely on status codes.
		await expect(page.locator('text=Not Found')).toBeVisible({ timeout: 2000 }).catch(async () => {
			await expect(page.locator('text=404')).toBeVisible({ timeout: 2000 });
		});
	});
});
