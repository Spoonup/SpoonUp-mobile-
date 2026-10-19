import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// True while the soft keyboard is up. Used to drop the bottom safe-area
// padding (the keyboard already covers the home-indicator area).
export const useKeyboardVisible = (): boolean => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(
      ios ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setVisible(true),
    );
    const hide = Keyboard.addListener(
      ios ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
};
