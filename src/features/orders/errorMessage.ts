import { ApiError } from '../../services/api/interceptors';

export const trackingError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Too many lookups. Please wait a minute and try again.';
    }
    if (error.status === 404 || error.status === 403) {
      return 'We couldn’t find an order with that reference. Check it and try again.';
    }
  }
  return 'We couldn’t look that up right now. Please try again.';
};
