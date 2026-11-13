import type { CartLine } from '../cart/services/cartService';

// Cart lines in the shape the backend expects (/api/cart/quote and
// /api/checkout/prepare). Only identifiers, quantities and the chosen slot are
// sent: the backend prices everything. Like the website, `scheduledFor` goes
// on kitchen ("now") lines only; pantry lines are rejected if they carry one.
export const toApiLines = (lines: CartLine[], scheduledFor?: string | null) =>
  lines.map(line => ({
    id: line.product.id,
    quantity: line.quantity,
    ...(scheduledFor && line.product.category === 'now'
      ? { scheduledFor }
      : {}),
  }));
