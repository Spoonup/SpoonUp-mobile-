import type { OrderStatus } from './types';

export type StepState = 'done' | 'current' | 'upcoming';
export type TimelineStep = {
  status: OrderStatus;
  label: string;
  state: StepState;
};

const LABEL: Record<OrderStatus, string> = {
  placed: 'Order placed',
  preparing: 'Confirmed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const FLOW: OrderStatus[] = [
  'placed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

// Pure mapping of the backend-returned status; no client-side inference.
export const buildTimeline = (status: OrderStatus): TimelineStep[] => {
  // A cancelled order only ever reached "placed".
  const steps: OrderStatus[] =
    status === 'cancelled' ? ['placed', 'cancelled'] : FLOW;
  const at = steps.indexOf(status);
  return steps.map((step, i) => ({
    status: step,
    label: LABEL[step],
    state: i < at ? 'done' : i === at ? 'current' : 'upcoming',
  }));
};
