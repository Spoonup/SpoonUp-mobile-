import { ApiError } from '../../services/api/interceptors';

// Maps backend errors to friendly copy; never surfaces raw messages.
export const friendlyError = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    const message = (error.body as { message?: string } | undefined)?.message;
    if (error.status === 422 && message) return message;
  }
  return fallback;
};
