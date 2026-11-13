// Expo inlines EXPO_PUBLIC_* only for literal `process.env.NAME` accesses.
const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS;

export type AppEnvironment = 'development' | 'staging' | 'production';

const resolveAppEnv = (value: string | undefined): AppEnvironment => {
  if (value === 'staging' || value === 'production') {
    return value;
  }
  return 'development';
};

if (!API_BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is not set. Check your .env file.');
}

export const env = {
  appEnv: resolveAppEnv(APP_ENV),
  apiBaseUrl: API_BASE_URL,
  // Mocks stay on unless USE_MOCKS=false, so tests and unconfigured builds
  // never hit a server.
  useMocks: USE_MOCKS !== 'false',
};
