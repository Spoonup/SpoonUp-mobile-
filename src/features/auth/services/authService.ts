// Auth service. Backend contract (SpoonUp-Website/server/index.js, API-CONTRACT.md):
//   POST /api/auth/login  { username (username OR email), password } -> { token, user }
//   POST /api/auth/signup { username, password, email, phone, referralCode? } -> { token, user }
// Mock mode (default) needs no network. Live mode stores the bearer token in
// secure storage; screens only see AuthSession. Google sign-in is a browser
// OAuth redirect on the web and is not wired in the app.
import { ApiError } from '../../../services/api/interceptors';
import { apiClient } from '../../../services/api/client';
import { mocksEnabled } from '../../../services/api/mode';
import { secureTokenStore } from '../../../services/storage/secureTokenStore';

export class AuthError extends Error {}

export type AuthSession = { name: string; email: string; phone: string };

export type SignupInput = {
  username: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
};

type ApiAuth = {
  token: string;
  user: { username: string; email: string; phone: string };
};

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const toError = (error: unknown): AuthError => {
  if (error instanceof ApiError) {
    const message = (error.body as { message?: unknown } | undefined)?.message;
    if (error.status === 429) {
      return new AuthError('Too many attempts. Wait a few minutes and retry.');
    }
    if (typeof message === 'string' && error.status < 500) {
      return new AuthError(message);
    }
  }
  return new AuthError(
    'Couldn’t reach SpoonUp. Check your connection and try again.',
  );
};

const accept = async ({ token, user }: ApiAuth): Promise<AuthSession> => {
  await secureTokenStore.setToken(token);
  return { name: user.username, email: user.email, phone: user.phone };
};

export const MOBILE_UNAVAILABLE =
  'Mobile sign-in isn’t available yet. Use email or username.';
export const MOCK_OTP_REJECT = '000000';

export const authService = {
  // TODO(api): backend gap, phone/OTP login. /api/auth/login only takes
  // username-or-email + password; there is no OTP endpoint. Live mode refuses.
  async requestMobileOtp(_phone: string): Promise<void> {
    if (!mocksEnabled) throw new AuthError(MOBILE_UNAVAILABLE);
    await delay(500);
  },

  async verifyMobileOtp(phone: string, code: string): Promise<AuthSession> {
    if (!mocksEnabled) throw new AuthError(MOBILE_UNAVAILABLE);
    await delay(600);
    // MOCK: any 6-digit code passes except 000000.
    if (!/^\d{6}$/.test(code) || code === MOCK_OTP_REJECT) {
      throw new AuthError('That code didn’t work. Try again.');
    }
    return { name: 'Guest', email: 'you@example.com', phone };
  },

  async login(identifier: string, password: string): Promise<AuthSession> {
    if (mocksEnabled) {
      await delay(700);
      // MOCK: any account works except the sentinel password below.
      if (password === 'wrongpass') throw new AuthError('Invalid credentials.');
      const name = identifier.includes('@')
        ? identifier.split('@')[0]
        : identifier;
      return {
        name: name.trim(),
        email: identifier.includes('@') ? identifier.trim() : 'you@example.com',
        phone: '9845012345',
      };
    }
    try {
      return await accept(
        await apiClient.post<ApiAuth>('/api/auth/login', {
          username: identifier.trim(),
          password,
        }),
      );
    } catch (error) {
      throw toError(error);
    }
  },

  async signup(input: SignupInput): Promise<AuthSession> {
    if (mocksEnabled) {
      await delay(900);
      // MOCK: the username "taken" simulates the backend 409.
      if (input.username.toLowerCase() === 'taken') {
        throw new AuthError('That username is already taken.');
      }
      return {
        name: input.username.trim(),
        email: input.email.trim(),
        phone: input.phone,
      };
    }
    try {
      return await accept(
        await apiClient.post<ApiAuth>('/api/auth/signup', {
          username: input.username.trim(),
          email: input.email.trim(),
          phone: input.phone,
          password: input.password,
          ...(input.referralCode ? { referralCode: input.referralCode } : {}),
        }),
      );
    } catch (error) {
      throw toError(error);
    }
  },
};
