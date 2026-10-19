import type { Product } from '../../shop/data/products';

export type CartLine = { product: Product; quantity: number };

// Backend-owned figures (totals, fees, discounts). The client only displays.
export type CartSummary = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export const cartService = {
  // MOCK: replace with API (POST /cart/validate -> backend-computed totals).
  // The arithmetic below stands in for the server and must not ship.
  async getSummary(lines: CartLine[]): Promise<CartSummary> {
    await new Promise<void>(resolve => setTimeout(resolve, 250));
    const subtotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.product.price,
      0,
    );
    return { subtotal, deliveryFee: 0, discount: 0, total: subtotal };
  },
};
