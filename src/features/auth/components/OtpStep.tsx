import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OtpInput } from '../../../components/common/OtpInput';
import { colors, fontFamily, spacing, typography } from '../../../theme';

type Props = {
  phone: string;
  otp: string;
  onOtpChange: (value: string) => void;
  error: string | null;
  busy: boolean;
  resendIn: number;
  onResend: () => void;
  onChangeNumber: () => void;
  onHelp: () => void;
};

export const OtpStep = ({
  phone,
  otp,
  onOtpChange,
  error,
  busy,
  resendIn,
  onResend,
  onChangeNumber,
  onHelp,
}: Props) => {
  const resendLabel =
    resendIn > 0
      ? `Resend in 0:${String(resendIn).padStart(2, '0')}`
      : 'Resend code';
  const status = error ?? (busy ? 'Verifying…' : 'Didn’t get it?');

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>CHECK YOUR MESSAGES</Text>
      <Text style={styles.headline}>Enter the code</Text>
      <Text style={styles.sub}>
        Sent to +91 {phone.slice(0, 5)} {phone.slice(5)} ·{' '}
        <Text
          onPress={onChangeNumber}
          style={styles.link}
          accessibilityRole="link"
        >
          Change
        </Text>
      </Text>
      <OtpInput value={otp} onChange={onOtpChange} hasError={!!error} />
      <View style={styles.statusRow} accessibilityLiveRegion="polite">
        <Text style={[styles.status, error ? styles.statusError : null]}>
          {status}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: resendIn > 0 }}
          disabled={resendIn > 0}
          onPress={onResend}
          hitSlop={8}
        >
          <Text style={[styles.resend, resendIn > 0 && styles.resendDisabled]}>
            {resendLabel}
          </Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Trouble signing in?"
        onPress={onHelp}
        style={styles.help}
      >
        <Text style={styles.resend}>Trouble signing in?</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.lg, paddingTop: spacing.xl },
  kicker: { ...typography.kicker, color: colors.tan },
  headline: {
    fontFamily: fontFamily.serif,
    fontSize: 34,
    lineHeight: 37,
    color: colors.ink,
  },
  sub: { ...typography.body, color: colors.textSecondary },
  link: { color: colors.olive, fontFamily: fontFamily.sansMedium },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  status: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  statusError: { color: colors.danger },
  help: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  resend: { ...typography.label, color: colors.olive },
  resendDisabled: { color: colors.textDisabled },
});
