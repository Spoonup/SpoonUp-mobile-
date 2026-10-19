import { PRODUCTS } from '../src/features/shop/data/products';
import { friendlyError } from '../src/features/checkout/errorMessage';
import {
  routeAfterSdk,
  routeAfterStatus,
} from '../src/features/checkout/paymentFlow';
import { checkoutService } from '../src/features/checkout/services/checkoutService';
import { paymentService } from '../src/features/checkout/services/paymentService';
import { validateAddress } from '../src/features/checkout/validation';
import { ApiError } from '../src/services/api/interceptors';

const valid = {
  name: 'Asha Rao',
  phone: '9876543210',
  line1: '14, 3rd Cross, HSR Layout',
  pincode: '560102',
  city: 'Bengaluru',
};

describe('validateAddress', () => {
  test('accepts a complete address', () => {
    expect(validateAddress(valid)).toEqual({});
  });

  test('flags every bad field', () => {
    const errors = validateAddress({
      name: '',
      phone: '12345',
      line1: 'abc',
      pincode: '56010',
      city: ' ',
    });
    expect(Object.keys(errors).sort()).toEqual(
      ['city', 'line1', 'name', 'phone', 'pincode'].sort(),
    );
  });

  test('pincode must be exactly 6 digits', () => {
    expect(
      validateAddress({ ...valid, pincode: '5601021' }).pincode,
    ).toBeDefined();
    expect(
      validateAddress({ ...valid, pincode: '56a102' }).pincode,
    ).toBeDefined();
  });
});

describe('payment state machine', () => {
  test('SDK success only leads to verification, never confirmation', () => {
    expect(routeAfterSdk('success')).toBe('verify');
    expect(routeAfterSdk('failed')).toBe('failed');
    expect(routeAfterSdk('cancelled')).toBe('cancelled');
  });

  test('confirmation requires a verified paid status', () => {
    expect(routeAfterStatus(undefined)).toBe('wait');
    expect(routeAfterStatus('pending')).toBe('wait');
    expect(routeAfterStatus('failed')).toBe('failed');
    expect(routeAfterStatus('paid')).toBe('confirmed');
  });
});

describe('mock services', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const run = async <T>(promise: Promise<T>): Promise<T> => {
    await jest.advanceTimersByTimeAsync(2000);
    return promise;
  };

  test('order intent is idempotent and status is pending before paid', async () => {
    const lines = [{ product: PRODUCTS[0], quantity: 1 }];
    const params = {
      lines,
      address: { id: 'a1', ...valid },
      option: {
        id: 'now',
        kind: 'immediate' as const,
        label: 'Deliver now',
        detail: '',
      },
      couponCode: null,
      idempotencyKey: paymentService.newIdempotencyKey(),
    };
    const first = await run(paymentService.createOrderIntent(params));
    const second = await run(paymentService.createOrderIntent(params));
    expect(second.orderId).toBe(first.orderId);

    const statuses = [];
    for (let i = 0; i < 3; i++) {
      statuses.push(
        (await run(paymentService.getPaymentStatus(first.orderId))).status,
      );
    }
    expect(statuses).toEqual(['pending', 'pending', 'paid']);
  });

  test('invalid coupon is rejected, then rate limited with 429', async () => {
    let last: unknown;
    for (let i = 0; i < 6; i++) {
      await run(checkoutService.applyCoupon('NOPE').catch(e => (last = e)));
    }
    expect((last as ApiError).status).toBe(429);
    expect(friendlyError(last, 'x')).toMatch(/too many attempts/i);
  });
});
