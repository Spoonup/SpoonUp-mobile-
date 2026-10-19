import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

// Always online until a connectivity source (e.g. netinfo) calls
// onlineManager.setOnline / setEventListener.
export const useOffline = (): boolean =>
  useSyncExternalStore(
    onlineManager.subscribe.bind(onlineManager),
    () => !onlineManager.isOnline(),
  );
