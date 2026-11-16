import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { mocksEnabled } from '../../../services/api/mode';
import { toApiLines } from '../../checkout/apiLines';
import type { Product } from '../../shop/data/products';

export type CartLine = { product: Product; quantity: number };

// Backend-owned figures (totals, fees, discounts). The client only displays.
export type CartSummary = {
  subtotal: number;
  // GST as returned by the backend (already inside `total`), when provided.
  tax?: number;
  // True when `total` is the backend's pre-coupon total: the coupon amount is
  // reserved server-side at payment, which returns the final charge.
  finalAtPayment?: boolean;
  subtotalPlaceholder?: never;
  deliveryFee: number;
  discount: number;
  // SpoonUp credit applied (display estimate; backend clamps at payment).
  credit?: number;
  total: number;
};

type QuoteResponse = {
  totals: {
    itemsSubtotal: number;
    taxTotal: number;
    calculatedTotal: number;
  };
  coupon?: { valid: boolean; discount?: number } | null;
};

// Display mapping only: every figure is the backend's.
export const summaryFromQuote = (quote: QuoteResponse): CartSummary => {
  const { itemsSubtotal, taxTotal, calculatedTotal } = quote.totals;
  const discount = quote.coupon?.valid ? quote.coupon.discount ?? 0 : 0;
  return {
    subtotal: itemsSubtotal,
    tax: taxTotal,
    deliveryFee: 0,
    discount,
    total: calculatedTotal,
    ...(discount > 0 ? { finalAtPayment: true } : {}),
  };
};

export const cartService = {
  // Live: POST /api/cart/quote (backend-priced; GST is added server-side and
  // is included in `total`/`subtotal`; the backend has no delivery fee).
  // Mock arithmetic below stands in for the server and must not ship.
  async getSummary(
    lines: CartLine[],
    couponCode?: string | null,
  ): Promise<CartSummary> {
    if (!mocksEnabled) {
      const quote = await apiClient.post<QuoteResponse>(endpoints.cartQuote, {
        lines: toApiLines(lines),
        ...(couponCode ? { couponCode } : {}),
      });
      return summaryFromQuote(quote);
    }
    await new Promise<void>(resolve => setTimeout(resolve, 250));
    const subtotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.product.price,
      0,
    );
    return { subtotal, deliveryFee: 0, discount: 0, total: subtotal };
  },
};
