export const SUBJECT_MIN = 3;
export const DESCRIPTION_MIN = 10;

export type TicketErrors = {
  category?: string;
  subject?: string;
  description?: string;
};

// UX-only; the backend re-validates everything.
export const validateTicket = (v: {
  category: string;
  subject: string;
  description: string;
}): TicketErrors => {
  const errors: TicketErrors = {};
  if (!v.category) errors.category = 'Please pick a category.';
  if (v.subject.trim().length < SUBJECT_MIN) {
    errors.subject = 'Please add a short subject.';
  }
  if (v.description.trim().length < DESCRIPTION_MIN) {
    errors.description = 'Please describe the issue (at least 10 characters).';
  }
  return errors;
};
