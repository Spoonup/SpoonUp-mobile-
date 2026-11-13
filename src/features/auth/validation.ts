// UX-only checks mirroring SpoonUp-Website/server (index.js signup/login,
// validators.js, security.js). The backend re-validates everything.
const USERNAME = /^[a-zA-Z0-9_]{3,32}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[6-9]\d{9}$/;

// Digits only, minus a leading 91 or 0, capped at 10 (validators.js phoneInputDigits).
export const phoneDigits = (raw: string): string => {
  const d = raw.replace(/\D/g, '');
  const stripped =
    d.length === 12 && d.startsWith('91')
      ? d.slice(2)
      : d.length === 11 && d.startsWith('0')
      ? d.slice(1)
      : d;
  return stripped.slice(0, 10);
};

export const validateIdentifier = (value: string): string | undefined =>
  value.trim() ? undefined : 'Enter your username or email.';

export const validateLoginPassword = (value: string): string | undefined =>
  value ? undefined : 'Enter your password.';

export const validateUsername = (value: string): string | undefined =>
  USERNAME.test(value.trim())
    ? undefined
    : 'Username must be 3-32 letters, numbers, or underscores.';

export const validateEmail = (value: string): string | undefined => {
  const v = value.trim();
  return v.length <= 254 && EMAIL.test(v)
    ? undefined
    : 'Enter a valid email address.';
};

export const validatePhone = (value: string): string | undefined =>
  PHONE.test(phoneDigits(value))
    ? undefined
    : 'Enter a valid 10-digit mobile number.';

export const validateNewPassword = (value: string): string | undefined =>
  value.length >= 8 && value.length <= 128
    ? undefined
    : 'Password must be 8-128 characters.';

// Login button enable rule for the mobile-number screen.
export const canSubmitMobile = (raw: string, busy = false): boolean =>
  !busy && validatePhone(raw) === undefined;
