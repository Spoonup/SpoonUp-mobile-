import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { colors, radius, typography } from '../../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export const TextField = ({ label, error, style, ...inputProps }: Props) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      accessibilityLabel={label}
      placeholderTextColor={colors.textDisabled}
      style={[styles.input, error ? styles.inputError : null, style]}
      {...inputProps}
    />
    {error ? (
      <Text accessibilityLiveRegion="polite" style={styles.error}>
        {error}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { ...typography.label, color: colors.ink },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md + 3,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 15,
  },
  inputError: { borderColor: colors.danger },
  error: { ...typography.bodySmall, color: colors.danger },
});
