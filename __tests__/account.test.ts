import { validateName } from '../src/features/account/validation';
import {
  emitSessionExpired,
  onSessionExpired,
} from '../src/services/api/sessionEvents';

test('validateName', () => {
  expect(validateName(' a ')).toBeDefined();
  expect(validateName('Asha')).toBeUndefined();
  expect(validateName('x'.repeat(61))).toBeDefined();
});

test('session expiry events reach subscribers until unsubscribed', () => {
  const fn = jest.fn();
  const off = onSessionExpired(fn);
  emitSessionExpired();
  off();
  emitSessionExpired();
  expect(fn).toHaveBeenCalledTimes(1);
});
