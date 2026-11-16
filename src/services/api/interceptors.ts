import { secureTokenStore } from '../storage/secureTokenStore';
import { emitSessionExpired } from './sessionEvents';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type RequestInterceptor = (
  init: RequestInit,
) => RequestInit | Promise<RequestInit>;

// Attaches default headers and the session token (backend accepts
// `Authorization: Bearer usr_...`) to every outgoing request.
export const withDefaultHeaders: RequestInterceptor = async init => {
  let token: string | null = null;
  try {
    token = await secureTokenStore.getToken();
  } catch {
    // No secure storage available: continue as a guest.
  }
  return {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  };
};

export const handleResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson
    ? await response.json().catch(() => undefined)
    : undefined;
  // A proxy/Cloudflare challenge or error page is HTML, not the API's JSON:
  // never hand it to callers as data (they would crash on the wrong shape).
  if (response.ok && !isJson && response.status !== 204) {
    throw new ApiError(502, undefined);
  }

  if (response.status === 401) emitSessionExpired();
  if (!response.ok) {
    // Backend errors are { error, code }; also expose `message` for helpers.
    const b = body as { error?: unknown; message?: unknown } | undefined;
    const normalized =
      b && typeof b === 'object' && b.message === undefined && b.error
        ? { ...b, message: b.error }
        : body;
    throw new ApiError(response.status, normalized);
  }

  return body;
};
