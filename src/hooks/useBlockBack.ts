import { useEffect } from 'react';
import { BackHandler } from 'react-native';

// Swallows the Android hardware back button while `block` is true (iOS no-op).
export const useBlockBack = (block: boolean) => {
  useEffect(() => {
    if (!block) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [block]);
};
