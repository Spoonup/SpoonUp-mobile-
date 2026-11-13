import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserFacingError,
  friendlyError,
} from '../src/features/checkout/errorMessage';
import {
  buildCheckoutHtml,
  isRazorpayTestKey,
  parseWebViewMessage,
} from '../src/features/payments/razorpay';
import { ApiError } from '../src/services/api/interceptors';

jest.mock('../src/services/api/client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('../src/features/payments/razorpay', () => ({
  ...jest.requireActual('../src/features/payments/razorpay'),
  startRazorpay: jest.fn(),
}));

const { apiClient } = require('../src/services/api/client');
const rz = require('../src/features/payments/razorpay');
const { liveCheckout } = require('../src/features/payments/liveCheckout');
const { orderTokens } = require('../src/services/storage/orderTokens');

const customer = { name: 'Asha', phone: '9876543210', email: 'a@b.co' };
const prepared = (keyId: string, id = 'chk-1') => ({
  checkoutId: id,
  amount: 525,
  razorpayKeyId: keyId,
  razorpayOrderId: 'order_1',
  checkoutToken: 'chk_tok_1',
});
const proof = {
  razorpayPaymentId: 'pay_1',
  razorpayOrderId: 'order_1',
  razorpaySignature: 'sig',
};

beforeEach(() => {
  apiClient.post.mockReset();
  apiClient.post.mockResolvedValue({});
  rz.startRazorpay.mockReset();
  return AsyncStorage.clear();
});

describe('razorpay helpers', () => {
  test('only test-mode key ids may open the sheet', () => {
    expect(isRazorpayTestKey('rzp_test_abc123')).toBe(true);
    expect(isRazorpayTestKey('rzp_live_abc123')).toBe(false);
    expect(isRazorpayTestKey('')).toBe(false);
    expect(isRazorpayTestKey(undefined)).toBe(false);
  });

  test('webview messages: proof = success, anything odd = failure', () => {
    expect(parseWebViewMessage(JSON.stringify({ proof })).kind).toBe('success');
    expect(parseWebViewMessage('{"cancelled":true}').kind).toBe('cancelled');
    expect(
      parseWebViewMessage('{"proof":{"razorpayPaymentId":"x"}}').kind,
    ).toBe('failed');
    expect(parseWebViewMessage('not json').kind).toBe('failed');
  });

  test('checkout html cannot be broken out of by hostile values', () => {
    const html = buildCheckoutHtml({
      keyId: 'rzp_test_k',
      razorpayOrderId: 'o</script><script>alert(1)</script>',
      amount: 10.5,
      prefill: { name: 'x', contact: '1', email: 'e' },
      brand: 'SpoonUp',
      themeColor: '#4A5D2E',
    });
    expect(html.match(/<\/script>/g)).toHaveLength(2);
    expect(html).toContain('"amount":1050');
  });
});

describe('liveCheckout', () => {
  test('a live or unknown key never starts a payment and releases the checkout', async () => {
    apiClient.post.mockResolvedValueOnce(prepared('rzp_live_x'));
    await expect(
      liveCheckout.prepare({ lines: [] }, customer),
    ).rejects.toBeInstanceOf(UserFacingError);
    expect(apiClient.post).toHaveBeenLastCalledWith('/api/checkout/abandon', {
      checkoutId: 'chk-1',
    });
    expect(rz.startRazorpay).not.toHaveBeenCalled();
    expect(await liveCheckout.pay('chk-1', () => {})).toBe('failed');
  });

  test('paid only when /complete returns a paid order; the SDK proof alone is never enough', async () => {
    apiClient.post.mockResolvedValueOnce(prepared('rzp_test_k'));
    const { checkoutId } = await liveCheckout.prepare({ lines: [] }, customer);
    // No SDK result yet: nothing to verify, stays pending, no backend call.
    expect(await liveCheckout.verify(checkoutId)).toEqual({
      status: 'pending',
    });

    rz.startRazorpay.mockResolvedValueOnce({ kind: 'success', proof });
    expect(await liveCheckout.pay(checkoutId, () => {})).toBe('success');

    apiClient.post.mockResolvedValueOnce({
      orders: [{ id: 'ord-9', paymentStatus: 'unpaid', accessToken: 'tok9' }],
    });
    expect(await liveCheckout.verify(checkoutId)).toEqual({
      status: 'pending',
    });
    expect(apiClient.post).toHaveBeenLastCalledWith('/api/checkout/complete', {
      checkoutId: 'chk-1',
      checkoutToken: 'chk_tok_1',
      ...proof,
    });

    apiClient.post.mockResolvedValueOnce({
      orders: [{ id: 'ord-9', paymentStatus: 'paid', accessToken: 'tok9' }],
    });
    expect(await liveCheckout.verify(checkoutId)).toEqual({
      status: 'paid',
      paymentReference: 'pay_1',
      orderId: 'ord-9',
    });
    // The placer's token is kept for tracking without sign-in.
    expect(await orderTokens.tokenFor('ord-9')).toBe('tok9');
  });

  test('backend rejection is failed, a transient error is retryable, cancel abandons', async () => {
    apiClient.post.mockResolvedValueOnce(prepared('rzp_test_k', 'chk-2'));
    await liveCheckout.prepare({ lines: [] }, customer);
    rz.startRazorpay.mockResolvedValueOnce({ kind: 'success', proof });
    await liveCheckout.pay('chk-2', () => {});
    apiClient.post.mockRejectedValueOnce(new ApiError(500, undefined));
    await expect(liveCheckout.verify('chk-2')).rejects.toBeInstanceOf(ApiError);
    apiClient.post.mockRejectedValueOnce(
      new ApiError(400, { message: 'Payment verification failed.' }),
    );
    expect(await liveCheckout.verify('chk-2')).toEqual({ status: 'failed' });

    apiClient.post.mockResolvedValueOnce(prepared('rzp_test_k', 'chk-3'));
    await liveCheckout.prepare({ lines: [] }, customer);
    rz.startRazorpay.mockResolvedValueOnce({ kind: 'cancelled' });
    expect(await liveCheckout.pay('chk-3', () => {})).toBe('cancelled');
    expect(apiClient.post).toHaveBeenLastCalledWith('/api/checkout/abandon', {
      checkoutId: 'chk-3',
    });
  });
});

test('friendlyError shows safe backend text for validation-type statuses only', () => {
  expect(
    friendlyError(
      new ApiError(400, { message: 'Enter a valid 6-digit pincode.' }),
      'x',
    ),
  ).toBe('Enter a valid 6-digit pincode.');
  expect(
    friendlyError(new ApiError(500, { message: 'boom' }), 'fallback'),
  ).toBe('fallback');
  expect(friendlyError(new UserFacingError('Not yet.'), 'x')).toBe('Not yet.');
});
