// POM: CartPage
export class CartPage {
  readonly page;
  constructor(page) { this.page = page; }

  async proceedToCheckout() {
    await this.page.locator('[data-test="checkout"]').click();
  }

  async removeItem(productDataTest: string) {
    const sel = `[data-test="remove-${productDataTest}"]`;
    await this.page.locator(sel).click();
  }

  async itemCount() {
    return await this.page.locator('.cart_item').count();
  }
}