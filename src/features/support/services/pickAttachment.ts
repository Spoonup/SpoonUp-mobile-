import type { PickedFile } from '../types';

// MOCK: no image/document picker is installed. Replace with
// react-native-image-picker / document-picker (requesting photo permission),
// returning null when the user cancels.
export const pickAttachment = async (): Promise<PickedFile | null> => ({
  uri: 'mock://photo.png',
  name: 'photo.png',
  mimeType: 'image/png',
  size: 240 * 1024,
});
