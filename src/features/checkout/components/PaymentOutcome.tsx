import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { colors, spacing, typography } from '../../../theme';

type Props = {
  title: string;
  message: string;
  onRetry: () => void;
  onBack: () => void;
  retryLabel?: string;
  backLabel?: string;
};

// Shared body for the Payment Failed and Payment Cancelled screens.
export const PaymentOutcome = ({
  title,
  message,
  onRetry,
  onBack,
  retryLabel = 'Try payment again',
  backLabel = 'Back to cart',
}: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 12 },
      ]}
    >
      <View style={styles.body}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.actions}>
        <Button label={retryLabel} onPress={onRetry} />
        <Button variant="outline" label={backLabel} onPress={onBack} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: spacing.xxl,
  },
  title: { ...typography.title, color: colors.ink, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: { gap: spacing.sm, paddingHorizontal: spacing.xl },
});
