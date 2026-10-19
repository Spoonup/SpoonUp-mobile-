import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';

type Props = {
  phone: string;
  onPhoneChange: (value: string) => void;
  valid: boolean;
  busy: boolean;
  onSubmit: () => void;
};

export const PhoneStep = ({
  phone,
  onPhoneChange,
  valid,
  busy,
  onSubmit,
}: Props) => {
  const hint = valid
    ? 'Looks good'
    : phone.length
    ? `${10 - phone.length} more digit${10 - phone.length > 1 ? 's' : ''} to go`
    : 'Enter your 10-digit mobile number';

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>SIGN IN OR SIGN UP</Text>
      <Text style={styles.headline}>What’s your number?</Text>
      <View style={[styles.field, valid && styles.fieldValid]}>
        <Text style={styles.prefix}>+91</Text>
        <TextInput
          value={formatPhone(phone)}
          onChangeText={onPhoneChange}
          keyboardType="number-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          placeholder="98450 12345"
          placeholderTextColor={colors.textDisabled}
          autoFocus
          accessibilityLabel="Mobile number"
          style={styles.input}
        />
      </View>
      <Text style={styles.sub}>
        We’ll text you a 6-digit code. New here? The same number creates your
        account.
      </Text>
      <View style={styles.footer}>
        <Text style={styles.hint}>{hint}</Text>
        <Button
          label="Send code"
          onPress={onSubmit}
          disabled={!valid}
          loading={busy}
        />
      </View>
    </View>
  );
};

const formatPhone = (digits: string) =>
  digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.lg, paddingTop: spacing.xl },
  kicker: { ...typography.kicker, color: colors.tan },
  headline: {
    fontFamily: fontFamily.serif,
    fontSize: 34,
    lineHeight: 37,
    color: colors.ink,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  fieldValid: { borderColor: colors.olive },
  prefix: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 17,
    color: colors.ink,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: 'rgba(27, 42, 24, 0.12)',
  },
  input: {
    flex: 1,
    minHeight: 54,
    fontFamily: fontFamily.sansMedium,
    fontSize: 19,
    letterSpacing: 0.8,
    color: colors.ink,
  },
  sub: { ...typography.bodySmall, color: colors.textSecondary },
  footer: { marginTop: 'auto', gap: 9, paddingBottom: spacing.lg },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
