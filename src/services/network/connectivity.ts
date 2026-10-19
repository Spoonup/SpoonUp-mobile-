import { onlineManager } from '@tanstack/react-query';

// SINGLE PLACE to hook real connectivity. @react-native-community/netinfo is
// not installed yet. After installing it, replace the body with:
//   NetInfo.addEventListener(s => onlineManager.setOnline(!!s.isConnected));
// useOffline() and the app-wide OfflineBanner follow onlineManager, so nothing
// else needs to change.
export const startConnectivityMonitoring = (): (() => void) => {
  onlineManager.setOnline(true); // MOCK: replace with NetInfo listener
  return () => {};
};
