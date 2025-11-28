// POM: CheckoutPage
import { parseCurrency } from '../utils.ts';

export class CheckoutPage {
  readonly page;
  constructor(page) { this.page = page; }

  async fillInfo(first: string, last: string, postal: string) {
    await this.page.fill('#first-name', first);
    await this.page.fill('#last-name', last);
    await this.page.fill('#postal-code', postal);
    await this.page.click('[data-test="continue"]');
  }

  async finish() {
    await this.page.click('[data-test="finish"]');
  }

  // Read item prices on overview
  async getItemPrices() {
    const loc = this.page.locator('.cart_item .inventory_item_price');
    const n = await loc.count();
    const prices: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = await loc.nth(i).textContent();
      prices.push(parseCurrency(t || '0'));
    }
    return prices;
  }

  async getSummary() {
    const sub = await this.page.locator('.summary_subtotal_label').textContent();
    const tax = await this.page.locator('.summary_tax_label').textContent();
    const total = await this.page.locator('.summary_total_label').textContent();
    return {
      subtotal: parseCurrency(sub || '0'),
      tax: parseCurrency(tax || '0'),
      total: parseCurrency(total || '0'),
    };
  }
}