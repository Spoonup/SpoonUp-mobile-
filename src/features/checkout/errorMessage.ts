import { ApiError } from '../../services/api/interceptors';

// An error whose message is already safe and written for the customer.
export class UserFacingError extends Error {}

// Backend errors are { error, code } with safe, customer-ready text (copied to
// `message` by the API layer); other failures use the caller's fallback.
const SHOWN_STATUSES = [400, 404, 409, 410, 422, 503];

export const friendlyError = (error: unknown, fallback: string): string => {
  if (error instanceof UserFacingError) return error.message;
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Too many attempts. Please wait a minute and try again.';
    }
    const message = (error.body as { message?: string } | undefined)?.message;
    if (SHOWN_STATUSES.includes(error.status) && typeof message === 'string') {
      return message;
    }
  }
  return fallback;
};
