import { EmptyState } from './EmptyState';

type Props = { message?: string; onRetry: () => void };

export const ErrorState = ({
  message = 'Check your connection and try again.',
  onRetry,
}: Props) => (
  <EmptyState
    title="Something went wrong"
    message={message}
    actionLabel="Try again"
    onAction={onRetry}
  />
);
