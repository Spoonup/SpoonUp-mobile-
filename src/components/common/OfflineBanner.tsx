import { StyleSheet, Text } from 'react-native';
import { colors, typography } from '../../theme';

// Presentational. Mounted once, app-wide, by AppShell (driven by useOffline()
// / TanStack onlineManager). Do not render it per screen.
export const OfflineBanner = ({
  visible,
  topInset = 0,
}: {
  visible: boolean;
  topInset?: number;
}) =>
  visible ? (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { paddingTop: topInset + 8 }]}
    >
      You’re offline. Showing what we last loaded.
    </Text>
  ) : null;

const styles = StyleSheet.create({
  banner: {
    ...typography.label,
    backgroundColor: colors.ink,
    color: colors.onDark,
    textAlign: 'center',
    paddingBottom: 8,
  },
});
