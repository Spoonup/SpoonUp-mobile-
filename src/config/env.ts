import { APP_ENV, API_BASE_URL } from '@env';

export type AppEnvironment = 'development' | 'staging' | 'production';

const resolveAppEnv = (value: string | undefined): AppEnvironment => {
  if (value === 'staging' || value === 'production') {
    return value;
  }
  return 'development';
};

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is not set. Check your .env file.');
}

export const env = {
  appEnv: resolveAppEnv(APP_ENV),
  apiBaseUrl: API_BASE_URL,
};
