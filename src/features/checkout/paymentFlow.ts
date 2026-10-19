import type { SdkOutcome, VerifiedStatus } from './types';

export type AfterSdk = 'verify' | 'failed' | 'cancelled';
export type AfterStatus = 'wait' | 'confirmed' | 'failed';

// The SDK callback is never proof of payment: even 'success' only moves the
// user to backend verification.
export const routeAfterSdk = (outcome: SdkOutcome): AfterSdk =>
  outcome === 'success' ? 'verify' : outcome;

// 'confirmed' is reachable only from a backend-verified 'paid' status.
export const routeAfterStatus = (status?: VerifiedStatus): AfterStatus => {
  if (status === 'paid') return 'confirmed';
  if (status === 'failed') return 'failed';
  return 'wait';
};
