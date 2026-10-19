import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useOffline } from '../../hooks/useOffline';
import { OfflineBanner } from './OfflineBanner';

// App-wide chrome. While offline the banner takes over the status-bar inset,
// so screens (which pad by insets.top) see top = 0 and nothing double-pads.
export const AppShell = ({ children }: { children: ReactNode }) => {
  const offline = useOffline();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.flex}>
      <OfflineBanner visible={offline} topInset={insets.top} />
      <SafeAreaInsetsContext.Provider
        value={offline ? { ...insets, top: 0 } : insets}
      >
        {children}
      </SafeAreaInsetsContext.Provider>
    </View>
  );
};

const styles = StyleSheet.create({ flex: { flex: 1 } });
