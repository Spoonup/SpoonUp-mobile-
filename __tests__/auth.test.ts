import {
  canSubmitMobile,
  phoneDigits,
  validateEmail,
  validateNewPassword,
  validatePhone,
  validateUsername,
} from '../src/features/auth/validation';
import {
  AuthError,
  authService,
} from '../src/features/auth/services/authService';

describe('auth validation (mirrors backend rules)', () => {
  test('username 3-32 letters, numbers, underscores', () => {
    expect(validateUsername('ab')).toBeDefined();
    expect(validateUsername('a b')).toBeDefined();
    expect(validateUsername('priya_01')).toBeUndefined();
  });
  test('password 8-128 characters', () => {
    expect(validateNewPassword('short')).toBeDefined();
    expect(validateNewPassword('longenough')).toBeUndefined();
  });
  test('email and Indian mobile', () => {
    expect(validateEmail('nope')).toBeDefined();
    expect(validateEmail('a@b.co')).toBeUndefined();
    expect(validatePhone('1234567890')).toBeDefined();
    expect(validatePhone('+91 98450 12345')).toBeUndefined();
    expect(phoneDigits('919845012345')).toBe('9845012345');
  });
});

describe('authService (mock mode)', () => {
  test('login resolves a session; bad password rejects', async () => {
    await expect(
      authService.login('priya', 'password1'),
    ).resolves.toMatchObject({
      name: 'priya',
    });
    await expect(
      authService.login('priya', 'wrongpass'),
    ).rejects.toBeInstanceOf(AuthError);
  });
  test('signup rejects a taken username', async () => {
    await expect(
      authService.signup({
        username: 'taken',
        email: 'a@b.co',
        phone: '9845012345',
        password: 'password1',
      }),
    ).rejects.toBeInstanceOf(AuthError);
  });
});

describe('mobile-number login', () => {
  test('Login enables only for a valid 10-digit number and not while busy', () => {
    expect(canSubmitMobile('')).toBe(false);
    expect(canSubmitMobile('98450 1234')).toBe(false);
    expect(canSubmitMobile('1234567890')).toBe(false);
    expect(canSubmitMobile('98450 12345')).toBe(true);
    expect(canSubmitMobile('9845012345', true)).toBe(false);
  });
  test('mock mode: any code passes except 000000', async () => {
    await expect(
      authService.requestMobileOtp('9845012345'),
    ).resolves.toBeUndefined();
    await expect(
      authService.verifyMobileOtp('9845012345', '123456'),
    ).resolves.toMatchObject({ phone: '9845012345' });
    await expect(
      authService.verifyMobileOtp('9845012345', '000000'),
    ).rejects.toBeInstanceOf(AuthError);
  });
  test('live mode: refuses with the friendly message (backend gap)', () => {
    let svc!: typeof authService;
    jest.isolateModules(() => {
      process.env.EXPO_PUBLIC_USE_MOCKS = 'false';
      svc = require('../src/features/auth/services/authService').authService;
    });
    process.env.EXPO_PUBLIC_USE_MOCKS = 'true';
    return expect(svc.requestMobileOtp('9845012345')).rejects.toThrow(
      'Mobile sign-in isn’t available yet. Use email or username.',
    );
  });
});
