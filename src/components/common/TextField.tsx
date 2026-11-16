import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, fontFamily, radius, typography } from '../../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  // Password field with a Show/Hide toggle (sets secureTextEntry itself).
  password?: boolean;
  // Pill-shaped input used on the sign-in screen (mockup 6a).
  pill?: boolean;
};

export const TextField = ({
  label,
  error,
  hint,
  password,
  pill,
  style,
  ...inputProps
}: Props) => {
  const [shown, setShown] = useState(false);
  const input = (
    <TextInput
      accessibilityLabel={label}
      placeholderTextColor={colors.textDisabled}
      style={[
        styles.input,
        pill ? styles.inputPill : null,
        error ? styles.inputError : null,
        password ? styles.inputPassword : null,
        style,
      ]}
      {...inputProps}
      secureTextEntry={password ? !shown : inputProps.secureTextEntry}
    />
  );
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {password ? (
        <View>
          {input}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={shown ? 'Hide password' : 'Show password'}
            onPress={() => setShown(value => !value)}
            hitSlop={6}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>{shown ? 'Hide' : 'Show'}</Text>
          </Pressable>
        </View>
      ) : (
        input
      )}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    ...typography.labelSmall,
    fontFamily: fontFamily.sansMedium,
    color: colors.ink,
  },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: 11,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: fontFamily.sans,
    fontSize: 14,
  },
  inputPill: {
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    borderColor: colors.borderInput,
  },
  inputPassword: { paddingRight: 64 },
  toggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { ...typography.label, color: colors.olive },
  inputError: { borderColor: colors.danger },
  hint: { ...typography.labelSmall, color: colors.textSecondary },
  error: { ...typography.bodySmall, color: colors.danger },
});
