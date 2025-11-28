// POM: InventoryPage
export class InventoryPage {
  readonly page;
  constructor(page) { this.page = page; }

  // Add product by data-test id (example id: add-to-cart-sauce-labs-backpack)
  async addToCart(productDataTest: string) {
    const sel = `[data-test="add-to-cart-${productDataTest}"]`;
    await this.page.locator(sel).waitFor({ state: 'visible' });
    await this.page.click(sel);
  }

  async openCart() {
    await this.page.locator('.shopping_cart_link').click();
  }

  // Convenience: add common product names
  async addBackpack() { await this.addToCart('sauce-labs-backpack'); }
  async addBikeLight() { await this.addToCart('sauce-labs-bike-light'); }
  async addBoltTShirt() { await this.addToCart('sauce-labs-bolt-t-shirt'); }
}