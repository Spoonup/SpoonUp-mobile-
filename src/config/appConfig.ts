import { env } from './env';
import { REQUEST_TIMEOUT_MS } from './constants';

export const appConfig = {
  env,
  requestTimeoutMs: REQUEST_TIMEOUT_MS,
};
