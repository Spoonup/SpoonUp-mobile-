import { colors } from '../../theme';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type Attachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
};

// A file chosen on-device, not yet uploaded.
export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
};

export type TicketMessage = {
  id: string;
  from: 'customer' | 'support';
  body: string;
  createdAt: string;
  attachment?: Attachment;
};

export type Ticket = {
  id: string;
  category: string;
  subject: string;
  status: TicketStatus;
  orderId?: string;
  updatedAt: string;
};

export type TicketDetail = Ticket & { messages: TicketMessage[] };

export type NewTicketInput = {
  category: string;
  orderId?: string;
  subject: string;
  description: string;
  file?: PickedFile;
};

export const CATEGORIES = [
  'Order issue',
  'Payment',
  'Delivery',
  'Product quality',
  '30-day plan',
  'Account',
  'Other',
] as const;

export const STATUS_UI: Record<
  TicketStatus,
  { label: string; color: string; bg: string }
> = {
  OPEN: { label: 'Open', color: colors.tagNow, bg: colors.tagNowBg },
  IN_PROGRESS: {
    label: 'In progress',
    color: colors.tagShips,
    bg: colors.tagShipsBg,
  },
  RESOLVED: { label: 'Resolved', color: colors.tagPlan, bg: colors.tagPlanBg },
  CLOSED: { label: 'Closed', color: colors.textMuted, bg: colors.disabledBg },
};

// Display rule only; the backend still rejects replies on closed tickets.
export const canReply = (status: TicketStatus): boolean => status !== 'CLOSED';

export const formatWhen = (iso: string): string =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
