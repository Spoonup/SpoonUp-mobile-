import type { CartLine } from '../cart/services/cartService';

export type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  pincode: string;
  city: string;
};

export type AddressInput = Omit<Address, 'id'>;

export type DeliveryKind = 'immediate' | 'scheduled' | 'in_days';

// Options are entirely backend-supplied; the app only renders them.
export type DeliveryOption = {
  id: string;
  kind: DeliveryKind;
  label: string;
  detail: string;
};

export type QuoteRequest = {
  lines: CartLine[];
  addressId: string;
  deliveryOptionId: string;
  couponCode: string | null;
};

export type OrderIntent = {
  orderId: string;
  amount: number;
  idempotencyKey: string;
};

export type SdkOutcome = 'success' | 'failed' | 'cancelled';

// Only the backend (after provider verification) can report 'paid'.
export type VerifiedStatus = 'pending' | 'paid' | 'failed';

export type PaymentStatusResult = {
  status: VerifiedStatus;
  paymentReference?: string;
};
