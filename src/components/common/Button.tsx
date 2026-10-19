import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline';
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        isInactive && styles.inactive,
        pressed && !isInactive && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.ink : colors.onDark} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isOutline ? colors.ink : colors.onDark },
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
    minHeight: 50,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.ink },
  outline: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'transparent',
  },
  inactive: { backgroundColor: colors.disabledBg, borderColor: 'transparent' },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { ...typography.button, textAlign: 'center' },
  labelInactive: { color: colors.textDisabled },
});
