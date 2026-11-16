import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Button } from '../../../components/common/Button';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../../theme';

type Props = {
  title: string;
  message: string;
  tone?: 'failed' | 'cancelled';
  // Label/value rows shown in the card (backend/intent data only).
  rows?: [string, string][];
  // Reassurance note below the card (failed only).
  note?: string;
  retryLabel?: string;
  onRetry: () => void;
  backLabel: string;
  onBack: () => void;
};

// Mockups 6d4 (failed) and 6d5 (cancelled): icon, serif title, detail rows,
// primary retry + outline back.
export const PaymentOutcome = ({
  title,
  message,
  tone = 'cancelled',
  rows = [],
  note,
  retryLabel = 'Try payment again',
  onRetry,
  backLabel,
  onBack,
}: Props) => {
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const failed = tone === 'failed';
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.body}>
        <View
          style={[styles.icon, failed ? styles.iconFailed : styles.iconCancel]}
        >
          <Svg width={28} height={28} viewBox="0 0 24 24">
            <Path
              d={failed ? 'M12 6v8M12 18v.01' : 'M7 7l10 10M17 7L7 17'}
              stroke={failed ? colors.danger : colors.ink}
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.message}>{message}</Text>
        {rows.length > 0 ? (
          <View style={styles.card}>
            {rows.map(([label, value], index) => (
              <View
                key={label}
                style={[styles.row, index > 0 && styles.rowBorder]}
              >
                <Text style={styles.label}>{label}</Text>
                <Text
                  style={[
                    styles.value,
                    failed && label === 'Reason' && styles.reason,
                  ]}
                  numberOfLines={1}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {note ? <Text style={styles.noteBox}>{note}</Text> : null}
      </View>
      <View style={[styles.actions, { paddingBottom: footerPad }]}>
        <Button variant="dark" label={retryLabel} onPress={onRetry} />
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
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
  },
  icon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconFailed: { backgroundColor: 'rgba(163, 74, 42, 0.12)' },
  iconCancel: { backgroundColor: colors.disabledBg },
  title: { ...typography.title, color: colors.ink, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    alignSelf: 'stretch',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    padding: 14,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  value: {
    ...typography.label,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  reason: { color: colors.danger },
  noteBox: {
    alignSelf: 'stretch',
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceMuted,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: { gap: spacing.sm, paddingHorizontal: spacing.xl },
});
