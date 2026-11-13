import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  // primary = olive pill; outline = bordered pill; dark = ink pill; sage = on dark surfaces.
  variant?: 'primary' | 'outline' | 'dark' | 'sage';
  accessibilityLabel?: string;
};

export const Button = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  accessibilityLabel,
}: Props) => {
  const isInactive = disabled || loading;
  const isOutline = variant === 'outline';
  const textColor =
    isOutline || variant === 'sage' ? colors.ink : colors.onDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isInactive && (isOutline ? styles.inactiveOutline : styles.inactive),
        pressed && !isInactive && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: textColor },
            isInactive && !isOutline && styles.labelInactive,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.olive },
  dark: { backgroundColor: colors.ink },
  sage: { backgroundColor: colors.sage },
  outline: {
    borderWidth: 1,
    borderColor: colors.borderButton,
    backgroundColor: 'transparent',
  },
  inactive: { backgroundColor: colors.sage, borderColor: 'transparent' },
  inactiveOutline: { opacity: 0.45 },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { ...typography.button, textAlign: 'center' },
  labelInactive: { color: colors.surface },
});
