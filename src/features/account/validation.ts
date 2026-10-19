// UX-only check; the backend re-validates.
export const validateName = (name: string): string | undefined => {
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Enter your name (at least 2 characters).';
  if (trimmed.length > 60) return 'Name must be 60 characters or fewer.';
  return undefined;
};
