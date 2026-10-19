import { validateAttachment } from '../src/features/support/attachment';
import { supportError } from '../src/features/support/errorMessage';
import {
  mockSupportControls,
  supportService,
} from '../src/features/support/services/supportService';
import { canReply, STATUS_UI } from '../src/features/support/types';
import { validateTicket } from '../src/features/support/validation';
import { ApiError } from '../src/services/api/interceptors';

const input = {
  category: 'Payment',
  subject: 'Hi there',
  description: 'Long enough text',
};

describe('validateAttachment', () => {
  test('accepts allowed types', () => {
    for (const [name, mimeType] of [
      ['a.JPG', 'image/jpeg'],
      ['a.png', 'image/png'],
      ['a.webp', 'image/webp'],
      ['a.pdf', 'application/pdf'],
    ]) {
      expect(validateAttachment({ name, mimeType, size: 1000 })).toBeNull();
    }
  });
  test('rejects bad type, mismatch, empty and oversize', () => {
    expect(
      validateAttachment({
        name: 'a.svg',
        mimeType: 'image/svg+xml',
        size: 10,
      }),
    ).toMatch(/isn’t supported/);
    expect(
      validateAttachment({ name: 'a.png', mimeType: 'text/html', size: 10 }),
    ).toMatch(/isn’t supported/);
    expect(
      validateAttachment({ name: 'a.png', mimeType: 'image/png', size: 0 }),
    ).toMatch(/empty/);
    expect(
      validateAttachment({
        name: 'a.png',
        mimeType: 'image/png',
        size: 6 * 1024 * 1024,
      }),
    ).toMatch(/too large/);
  });
});

describe('status mapping', () => {
  test('every status has a label and replies close on CLOSED only', () => {
    expect(STATUS_UI.IN_PROGRESS.label).toBe('In progress');
    expect(canReply('CLOSED')).toBe(false);
    expect(canReply('RESOLVED')).toBe(true);
  });
});

describe('validateTicket', () => {
  test('flags required fields', () => {
    expect(
      Object.keys(
        validateTicket({ category: '', subject: '', description: '' }),
      ),
    ).toHaveLength(3);
    expect(validateTicket(input)).toEqual({});
  });
});

describe('supportError', () => {
  test('maps 429 and open-ticket without leaking server text', () => {
    expect(supportError(new ApiError(429, undefined), 'ticket')).toMatch(
      /3 new tickets/,
    );
    expect(supportError(new ApiError(429, undefined), 'reply')).toMatch(
      /too quickly/,
    );
    expect(
      supportError(new ApiError(409, { code: 'OPEN_TICKET_EXISTS' }), 'ticket'),
    ).toMatch(/already have an open ticket/);
    expect(
      supportError(new ApiError(500, { message: 'SQL boom' }), 'ticket'),
    ).not.toMatch(/SQL/);
  });
});

describe('mock service', () => {
  beforeEach(() => mockSupportControls.reset());
  test('create succeeds, then open-ticket blocks, 429 when forced', async () => {
    const t = await supportService.create(input);
    expect(t.status).toBe('OPEN');
    await expect(supportService.create(input)).rejects.toMatchObject({
      status: 409,
    });
    mockSupportControls.force = 'rate_limit';
    await expect(supportService.create(input)).rejects.toMatchObject({
      status: 429,
    });
  });
});
