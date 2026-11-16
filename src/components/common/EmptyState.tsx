import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export const EmptyState = ({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: Props) => (
  <View style={styles.wrap}>
    <Text accessibilityRole="header" style={styles.title}>
      {title}
    </Text>
    <Text style={styles.message}>{message}</Text>
    {actionLabel && onAction ? (
      <View style={styles.action}>
        <Button variant="dark" label={actionLabel} onPress={onAction} />
      </View>
    ) : null}
    {secondaryLabel && onSecondary ? (
      <View style={styles.action}>
        <Button
          variant="outline"
          label={secondaryLabel}
          onPress={onSecondary}
        />
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
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
    maxWidth: 260,
  },
  action: { marginTop: spacing.sm, minWidth: 180 },
});
