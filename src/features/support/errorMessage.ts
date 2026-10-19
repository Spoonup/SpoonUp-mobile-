import { ApiError } from '../../services/api/interceptors';

export const OPEN_TICKET_CODE = 'OPEN_TICKET_EXISTS';

// The service/backend decides rate limits and open-ticket rules; this only
// maps the result to friendly copy and never surfaces raw server text.
export const supportError = (
  error: unknown,
  kind: 'ticket' | 'reply',
): string => {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return kind === 'ticket'
        ? 'You’ve reached the limit of 3 new tickets per hour. Please try again later.'
        : 'You’re replying too quickly. Please wait a minute and try again.';
    }
    const code = (error.body as { code?: string } | undefined)?.code;
    if (error.status === 409 && code === OPEN_TICKET_CODE) {
      return 'You already have an open ticket. Please wait for it to be resolved, or reply on it.';
    }
    if (error.status === 403 || error.status === 404) {
      return 'We couldn’t find that ticket.';
    }
  }
  return kind === 'ticket'
    ? 'We couldn’t submit your ticket. Please try again.'
    : 'We couldn’t send your reply. Please try again.';
};
