import { appConfig } from '../../config/appConfig';
import { handleResponse, withDefaultHeaders } from './interceptors';

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

const request = async <T>(
  path: string,
  { body, ...init }: RequestOptions = {},
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    appConfig.requestTimeoutMs,
  );

  try {
    const finalInit = await withDefaultHeaders({
      ...init,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const response = await fetch(
      `${appConfig.env.apiBaseUrl}${path}`,
      finalInit,
    );
    return (await handleResponse(response)) as T;
  } finally {
    clearTimeout(timeout);
  }
};

export const apiClient = {
  get: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'PUT', body }),
  delete: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'DELETE' }),
};
