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

// Attaches default headers to every outgoing request. Add auth-token
// injection here once an auth/session service exists.
export const withDefaultHeaders: RequestInterceptor = init => ({
  ...init,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...init.headers,
  },
});

export const handleResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => undefined)
    : await response.text();

  if (response.status === 401) emitSessionExpired();
  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body;
};
