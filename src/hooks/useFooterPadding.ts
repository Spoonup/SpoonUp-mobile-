import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from './useKeyboardVisible';

// Bottom padding for pinned footers. Some Android gesture/3-button setups
// report a 0 bottom inset, which put the button under the nav bar. While the
// keyboard is up it already covers that area.
export const useFooterPadding = (): number => {
  const { bottom } = useSafeAreaInsets();
  const keyboard = useKeyboardVisible();
  if (keyboard) return 12;
  return Math.max(bottom, Platform.OS === 'android' ? 16 : 0) + 12;
};
