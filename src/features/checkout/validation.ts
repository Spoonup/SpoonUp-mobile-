import type { AddressInput } from './types';

export type AddressErrors = Partial<Record<keyof AddressInput, string>>;

// UX-only checks; the backend re-validates every address.
export const validateAddress = (input: AddressInput): AddressErrors => {
  const errors: AddressErrors = {};
  if (input.name.trim().length < 2) errors.name = 'Enter the recipient’s name.';
  if (!/^[6-9]\d{9}$/.test(input.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit mobile number.';
  }
  if (input.line1.trim().length < 5) {
    errors.line1 = 'Enter your house, street and area.';
  }
  if (!/^\d{6}$/.test(input.pincode.trim())) {
    errors.pincode = 'Pincode must be 6 digits.';
  }
  if (input.city.trim().length < 2) errors.city = 'Enter your city.';
  return errors;
};
