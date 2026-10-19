import { ApiError } from '../../../services/api/interceptors';
import type { CartLine, CartSummary } from '../../cart/services/cartService';
import type { DeliveryOption, QuoteRequest } from '../types';

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 300));

const COUPONS: Record<string, { percent: number; message: string }> = {
  SPOON10: { percent: 10, message: '10% off applied' },
};
const MAX_BAD_COUPONS = 5;
let badCoupons = 0;

export const checkoutService = {
  // MOCK: replace with API (GET /checkout/delivery-options).
  async getDeliveryOptions(lines: CartLine[]): Promise<DeliveryOption[]> {
    await delay();
    const has = (category: string) =>
      lines.some(line => line.product.category === category);
    return [
      ...(has('now')
        ? [
            {
              id: 'now',
              kind: 'immediate',
              label: 'Deliver now',
              detail: 'Arrives in about 30 minutes',
            },
            {
              id: 'slot-eve',
              kind: 'scheduled',
              label: 'Today, 7–8 pm',
              detail: 'Scheduled slot',
            },
            {
              id: 'slot-morn',
              kind: 'scheduled',
              label: 'Tomorrow, 8–9 am',
              detail: 'Scheduled slot',
            },
          ]
        : []),
      ...(has('ships')
        ? [
            {
              id: 'courier',
              kind: 'in_days',
              label: 'Courier',
              detail: 'Delivered in 3–5 days',
            },
          ]
        : []),
    ] as DeliveryOption[];
  },

  // MOCK: replace with API (POST /checkout/coupon). Validity and rate limits
  // (429) are decided by the backend.
  async applyCoupon(code: string): Promise<{ code: string; message: string }> {
    await delay();
    const key = code.trim().toUpperCase();
    if (badCoupons >= MAX_BAD_COUPONS) throw new ApiError(429, undefined);
    const coupon = COUPONS[key];
    if (!coupon) {
      badCoupons += 1;
      throw new ApiError(422, { message: 'That coupon isn’t valid.' });
    }
    return { code: key, message: coupon.message };
  },

  // MOCK: replace with API (POST /checkout/quote -> backend-computed totals).
  // The arithmetic stands in for the server and must not ship.
  async getQuote(request: QuoteRequest): Promise<CartSummary> {
    await delay();
    const subtotal = request.lines.reduce(
      (sum, line) => sum + line.quantity * line.product.price,
      0,
    );
    const percent = COUPONS[request.couponCode ?? '']?.percent ?? 0;
    const discount = Math.round((subtotal * percent) / 100);
    const deliveryFee = request.deliveryOptionId === 'now' ? 29 : 0;
    return {
      subtotal,
      deliveryFee,
      discount,
      total: subtotal + deliveryFee - discount,
    };
  },
};
