import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { ApiError } from '../../../services/api/interceptors';
import { mocksEnabled } from '../../../services/api/mode';
import {
  summaryFromQuote,
  type CartLine,
  type CartSummary,
} from '../../cart/services/cartService';
import { toApiLines } from '../apiLines';
import type { DeliveryOption, QuoteRequest } from '../types';

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 300));

const COUPONS: Record<string, { percent: number; message: string }> = {
  SPOON10: { percent: 10, message: '10% off applied' },
};
const MAX_BAD_COUPONS = 5;
let badCoupons = 0;

// GET /api/schedule/slots (public; hours/lead time are admin settings).
type ApiSlots = {
  enabled: boolean;
  days: {
    date: string;
    label: string;
    slots: { start: string; end: string; label: string }[];
  }[];
};

// Shows the first days only so the list stays usable; the backend still
// validates whichever slot is chosen.
const SLOT_DAYS = 2;

// Delivery choices from backend data (the site's checkout does the same: ASAP
// or a bookable slot for kitchen items, courier for pantry items). No ETA is
// computed here.
export const buildDeliveryOptions = (
  lines: CartLine[],
  slots: ApiSlots | null,
): DeliveryOption[] => {
  const has = (category: string) =>
    lines.some(line => line.product.category === category);
  const options: DeliveryOption[] = [];
  if (has('now')) {
    options.push({
      id: 'now',
      kind: 'immediate',
      label: 'Deliver now',
      detail: 'Made fresh after you order',
    });
    if (slots?.enabled) {
      for (const day of slots.days.slice(0, SLOT_DAYS)) {
        for (const slot of day.slots) {
          options.push({
            id: `slot:${slot.start}`,
            kind: 'scheduled',
            label: `${day.label}, ${slot.label}`,
            detail: 'Scheduled slot',
            scheduledFor: slot.start,
          });
        }
      }
    }
  }
  if (has('ships')) {
    options.push({
      id: 'courier',
      kind: 'in_days',
      label: 'Courier',
      detail: 'Ships to your address',
    });
  }
  return options;
};

export const checkoutService = {
  // Live: GET /api/schedule/slots (only when the cart has kitchen items).
  // Mock options below stand in for it.
  async getDeliveryOptions(lines: CartLine[]): Promise<DeliveryOption[]> {
    if (!mocksEnabled) {
      const needsSlots = lines.some(line => line.product.category === 'now');
      const slots = needsSlots
        ? await apiClient.get<ApiSlots>(endpoints.scheduleSlots)
        : null;
      return buildDeliveryOptions(lines, slots);
    }
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

  // Live: POST /api/coupons/validate (200 with valid:false for a bad coupon;
  // 429 from the rate limiter). Validity is decided by the backend.
  async applyCoupon(
    code: string,
    lines: CartLine[] = [],
  ): Promise<{ code: string; message: string }> {
    if (!mocksEnabled) {
      const res = await apiClient.post<{
        valid: boolean;
        code?: string;
        discount?: number;
        message?: string;
      }>(endpoints.couponValidate, {
        code: code.trim(),
        lines: toApiLines(lines),
      });
      if (!res.valid) {
        throw new ApiError(422, {
          message: res.message ?? 'That coupon isn’t valid.',
        });
      }
      return {
        code: res.code ?? code.trim().toUpperCase(),
        message: `₹${res.discount ?? 0} off applied`,
      };
    }
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

  // Live: POST /api/cart/quote with couponCode and the chosen slot. Totals
  // and the coupon discount are the backend's; nothing is computed here.
  // Mock arithmetic below stands in for the server and must not ship.
  async getQuote(request: QuoteRequest): Promise<CartSummary> {
    if (!mocksEnabled) {
      return summaryFromQuote(
        await apiClient.post(endpoints.cartQuote, {
          lines: toApiLines(request.lines, request.scheduledFor),
          ...(request.couponCode ? { couponCode: request.couponCode } : {}),
        }),
      );
    }
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
