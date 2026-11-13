// TODO(api): backend gap, no mobile-usable endpoint for support tickets; stays mock.
import { ApiError } from '../../../services/api/interceptors';
import { OPEN_TICKET_CODE } from '../errorMessage';
import type {
  NewTicketInput,
  PickedFile,
  Ticket,
  TicketDetail,
  TicketMessage,
} from '../types';

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 400));
const HOUR = 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

// MOCK: in-memory store standing in for the support API. Rules below
// (rate limits, one open ticket) are server-side in production.
let tickets: TicketDetail[] = [
  {
    id: 'T-1002',
    category: 'Delivery',
    subject: 'Order arrived late',
    status: 'RESOLVED',
    orderId: 'SU-24802',
    updatedAt: ago(26 * HOUR),
    messages: [
      {
        id: 'm1',
        from: 'customer',
        body: 'My order showed up 40 minutes after the slot.',
        createdAt: ago(30 * HOUR),
      },
      {
        id: 'm2',
        from: 'support',
        body: 'Sorry about that! We’ve added store credit to your account.',
        createdAt: ago(26 * HOUR),
      },
    ],
  },
  {
    id: 'T-0990',
    category: 'Payment',
    subject: 'Double charge on plan',
    status: 'CLOSED',
    updatedAt: ago(200 * HOUR),
    messages: [
      {
        id: 'm3',
        from: 'customer',
        body: 'I think I was charged twice.',
        createdAt: ago(210 * HOUR),
      },
    ],
  },
];
let created: number[] = [];
let replies: number[] = [];
let nextId = 1;

// Lets tests/demos force a server outcome.
export const mockSupportControls = {
  force: null as null | 'rate_limit' | 'open_ticket',
  reset() {
    this.force = null;
    created = [];
    replies = [];
  },
};

const summary = ({ messages: _m, ...ticket }: TicketDetail): Ticket => ticket;
const upload = (file?: PickedFile) =>
  file
    ? {
        id: `att-${nextId++}`,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
      }
    : undefined;

export const supportService = {
  // MOCK: replace with API (GET /support/tickets, scoped to the signed-in user).
  async list(): Promise<Ticket[]> {
    await delay();
    return [...tickets]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(summary);
  },

  // MOCK: replace with API (GET /support/tickets/:id); ownership enforced server-side.
  async get(id: string): Promise<TicketDetail> {
    await delay();
    const ticket = tickets.find(item => item.id === id);
    if (!ticket) throw new ApiError(404, undefined);
    return ticket;
  },

  // MOCK: replace with API (POST /support/tickets, multipart). Email to support
  // is a backend side effect and never affects this result.
  async create(input: NewTicketInput): Promise<Ticket> {
    await delay();
    const now = Date.now();
    created = created.filter(at => now - at < HOUR);
    if (mockSupportControls.force === 'rate_limit' || created.length >= 3) {
      throw new ApiError(429, undefined);
    }
    const hasOpen = tickets.some(
      t => t.status === 'OPEN' || t.status === 'IN_PROGRESS',
    );
    if (mockSupportControls.force === 'open_ticket' || hasOpen) {
      throw new ApiError(409, { code: OPEN_TICKET_CODE });
    }
    created.push(now);
    const ticket: TicketDetail = {
      id: `T-${1100 + nextId++}`,
      category: input.category,
      subject: input.subject.trim(),
      status: 'OPEN',
      orderId: input.orderId,
      updatedAt: new Date(now).toISOString(),
      messages: [
        {
          id: `m-${nextId++}`,
          from: 'customer',
          body: input.description.trim(),
          createdAt: new Date(now).toISOString(),
          attachment: upload(input.file),
        },
      ],
    };
    tickets = [ticket, ...tickets];
    return summary(ticket);
  },

  // MOCK: replace with API (POST /support/tickets/:id/replies).
  async reply(
    id: string,
    body: string,
    file?: PickedFile,
  ): Promise<TicketMessage> {
    await delay();
    const now = Date.now();
    replies = replies.filter(at => now - at < 60 * 1000);
    if (mockSupportControls.force === 'rate_limit' || replies.length >= 5) {
      throw new ApiError(429, undefined);
    }
    const ticket = tickets.find(item => item.id === id);
    if (!ticket) throw new ApiError(404, undefined);
    if (ticket.status === 'CLOSED') throw new ApiError(409, undefined);
    replies.push(now);
    const message: TicketMessage = {
      id: `m-${nextId++}`,
      from: 'customer',
      body: body.trim(),
      createdAt: new Date(now).toISOString(),
      attachment: upload(file),
    };
    ticket.messages = [...ticket.messages, message];
    ticket.updatedAt = message.createdAt;
    return message;
  },

  // MOCK: replace with API (GET /support/attachments/:id/url) returning a
  // short-lived signed URL after an authorization check. Files are private.
  async getAttachmentUrl(attachmentId: string): Promise<string> {
    await delay();
    return `https://files.example.invalid/support/${attachmentId}?sig=mock`;
  },
};
