// Razorpay Standard Checkout inside react-native-webview (Expo Go cannot load
// the native Razorpay SDK). Same approach as KesarMahal-Mobile. The result is a
// UI hint only: the backend verifies the signature in /api/checkout/complete.

export type RazorpayProof = {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
};

export type RazorpayRequest = {
  keyId: string;
  razorpayOrderId: string;
  // Backend-confirmed amount in rupees, passed to the sheet for display only.
  // Razorpay charges the amount stored on the order it created server-side.
  amount: number;
  prefill: { name: string; contact: string; email: string };
  brand: string;
  themeColor: string;
};

export type RazorpayResult =
  | { kind: 'success'; proof: RazorpayProof }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string };

// Real money is never started from a test build against a live key (or an
// unknown one): only Razorpay test-mode keys open the sheet.
export const isRazorpayTestKey = (keyId: string | undefined): boolean =>
  typeof keyId === 'string' && /^rzp_test_[A-Za-z0-9]+$/.test(keyId);

// Safe to inline inside a <script>: no raw "<" and no JS line separators.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const safeJson = (value: unknown): string =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .split(LS)
    .join('\\u2028')
    .split(PS)
    .join('\\u2029');

export const buildCheckoutHtml = (req: RazorpayRequest): string => {
  const options = {
    key: req.keyId,
    order_id: req.razorpayOrderId,
    amount: Math.round(req.amount * 100),
    currency: 'INR',
    name: req.brand,
    prefill: req.prefill,
    theme: { color: req.themeColor },
  };
  return `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:${
    req.themeColor
  }">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script><script>
var post=function(m){window.ReactNativeWebView.postMessage(JSON.stringify(m))};
var o=${safeJson(options)};
o.handler=function(r){post({proof:{razorpayPaymentId:r.razorpay_payment_id,razorpayOrderId:r.razorpay_order_id,razorpaySignature:r.razorpay_signature}})};
o.modal={ondismiss:function(){post({cancelled:true})}};
window.onload=function(){try{var rz=new Razorpay(o);rz.on('payment.failed',function(e){post({error:(e&&e.error&&e.error.description)||'Payment failed. Please try again.'})});rz.open()}catch(e){post({error:'Could not reach Razorpay. Please try again.'})}};
</script></body>`;
};

// Parses a WebView message. Anything malformed is a failure, never a success.
export const parseWebViewMessage = (raw: string): RazorpayResult => {
  try {
    const m = JSON.parse(raw) as {
      proof?: Partial<RazorpayProof>;
      cancelled?: boolean;
      error?: string;
    };
    const p = m.proof;
    if (
      p &&
      typeof p.razorpayPaymentId === 'string' &&
      typeof p.razorpayOrderId === 'string' &&
      typeof p.razorpaySignature === 'string'
    ) {
      return { kind: 'success', proof: p as RazorpayProof };
    }
    if (m.cancelled) return { kind: 'cancelled' };
    return {
      kind: 'failed',
      message:
        typeof m.error === 'string' ? m.error : 'Payment failed. Try again.',
    };
  } catch {
    return { kind: 'failed', message: 'Payment failed. Try again.' };
  }
};

// Navigation params must be serialisable, so the request and the promise that
// resolves with the result live here (set by the service, read by the screen).
let pending: {
  req: RazorpayRequest;
  resolve: (r: RazorpayResult) => void;
} | null = null;

export const takeRazorpayRequest = (): RazorpayRequest | undefined =>
  pending?.req;

export const startRazorpay = (
  req: RazorpayRequest,
  open: () => void,
): Promise<RazorpayResult> =>
  new Promise(resolve => {
    pending = { req, resolve };
    open();
  });

export const settleRazorpay = (result: RazorpayResult) => {
  const current = pending;
  pending = null;
  current?.resolve(result);
};
