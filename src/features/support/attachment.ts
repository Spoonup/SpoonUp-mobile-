// Client-side checks are UX only; the backend enforces type, size and content.
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;
export const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'pdf'] as const;
export const ATTACHMENT_HINT = 'JPG, PNG, WEBP or PDF, up to 5 MB';

export const formatSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const validateAttachment = (file: {
  name: string;
  mimeType: string;
  size: number;
}): string | null => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (
    !(ALLOWED_EXT as readonly string[]).includes(ext) ||
    !(ALLOWED_MIME as readonly string[]).includes(file.mimeType.toLowerCase())
  ) {
    return `That file type isn’t supported. Please use ${ATTACHMENT_HINT}.`;
  }
  if (file.size <= 0) return 'That file looks empty. Please pick another.';
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `That file is too large (${formatSize(
      file.size,
    )}). The limit is 5 MB.`;
  }
  return null;
};
