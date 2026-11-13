import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../../components/common/Button';
import { AppleIcon, GoogleIcon } from '../../../components/common/Icon';
import { OtpInput } from '../../../components/common/OtpInput';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';
import {
  AuthError,
  authService,
  type AuthSession,
} from '../services/authService';
import { canSubmitMobile, phoneDigits } from '../validation';

type Props = {
  offline: boolean;
  onSignedIn: (session: AuthSession) => void;
  onUseEmail: () => void;
  onSignup: () => void;
  onSkip: () => void;
};

// Mobile-number sign-in (mockup). Mock mode: number -> mock OTP. Live mode:
// the backend has no phone/OTP login, so Login shows a friendly message and
// "Use email or username instead" opens the working password form.
export const MobileLogin = ({
  offline,
  onSignedIn,
  onUseEmail,
  onSignup,
  onSkip,
}: Props) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (e: unknown) =>
    setError(
      e instanceof AuthError ? e.message : 'Something went wrong. Try again.',
    );

  const requestOtp = async () => {
    if (!canSubmitMobile(phone, busy)) return;
    setBusy(true);
    setError(null);
    try {
      await authService.requestMobileOtp(phone);
      setStep('otp');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const changeOtp = async (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length < 6 || busy) return;
    setBusy(true);
    try {
      onSignedIn(await authService.verifyMobileOtp(phone, value));
    } catch (e) {
      fail(e);
      setOtp('');
    } finally {
      setBusy(false);
    }
  };

  const header = (
    <Image
      source={require('../../../assets/images/spoonup-logo.png')}
      style={styles.logo}
      resizeMode="contain"
      accessibilityLabel="SpoonUp"
    />
  );

  if (step === 'otp') {
    return (
      <View style={styles.wrap}>
        {header}
        <Text accessibilityRole="header" style={styles.h1}>
          Enter the code
        </Text>
        <Text style={styles.sub}>
          Sent to +91 {phone.slice(0, 5)} {phone.slice(5)}
        </Text>
        <OtpInput value={otp} onChange={changeOtp} hasError={!!error} />
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.helper, error ? styles.error : null]}
        >
          {error ?? (busy ? 'Verifying…' : 'Enter the 6-digit code.')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setStep('phone');
            setOtp('');
            setError(null);
          }}
          style={styles.link}
        >
          <Text style={styles.olive}>Change number</Text>
        </Pressable>
      </View>
    );
  }

  const enabled = canSubmitMobile(phone, busy) && !offline;
  return (
    <View style={styles.wrap}>
      {header}
      <Text accessibilityRole="header" style={styles.h1}>
        Welcome to SpoonUp
      </Text>
      <Text style={styles.sub}>Sign in with your mobile number.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Mobile number</Text>
        <View style={[styles.pill, error ? styles.pillError : null]}>
          <Text style={styles.prefix}>+91</Text>
          <View style={styles.sep} />
          <TextInput
            accessibilityLabel="Mobile number"
            value={phone}
            onChangeText={v => {
              setPhone(phoneDigits(v));
              setError(null);
            }}
            placeholder="98450 12345"
            placeholderTextColor={colors.textDisabled}
            keyboardType="number-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={10}
            returnKeyType="go"
            onSubmitEditing={requestOtp}
            style={styles.input}
          />
        </View>
        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.helper, styles.error]}
          >
            {error}
          </Text>
        ) : (
          <Text style={styles.helper}>Enter your 10-digit mobile number</Text>
        )}
      </View>
      {offline ? (
        <Text style={styles.helper}>
          You are offline. Reconnect to continue.
        </Text>
      ) : null}

      <Button
        label="Login"
        onPress={requestOtp}
        loading={busy}
        disabled={!enabled}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onUseEmail}
        hitSlop={8}
        style={styles.link}
      >
        <Text style={styles.olive}>Use email or username instead</Text>
      </Pressable>

      <View style={styles.orRow}>
        <View style={styles.rule} />
        <Text style={styles.helper}>Or continue with</Text>
        <View style={styles.rule} />
      </View>
      <View style={styles.row}>
        <Social label="Google" icon={<GoogleIcon />} />
        <Social label="Apple" icon={<AppleIcon color={colors.ink} />} />
      </View>

      <Text style={styles.center}>
        <Text style={styles.sub}>New to SpoonUp? </Text>
        <Text accessibilityRole="link" onPress={onSignup} style={styles.olive}>
          Sign up
        </Text>
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onSkip}
        hitSlop={8}
        style={styles.link}
      >
        <Text style={styles.sub}>Just browsing? Skip for now</Text>
      </Pressable>
    </View>
  );
};

// Disabled: the backend only has a web-redirect Google flow and no Apple flow.
const Social = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
  <View
    accessible
    accessibilityRole="button"
    accessibilityLabel={`${label}, coming soon`}
    accessibilityState={{ disabled: true }}
    style={[styles.social, styles.soon]}
  >
    {icon}
    <Text style={styles.socialLabel}>{label}</Text>
    <Text style={styles.soonTag}>Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg, alignItems: 'stretch' },
  logo: { width: 190, height: 96, alignSelf: 'center', marginTop: spacing.xl },
  h1: {
    fontFamily: fontFamily.serif,
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  field: { gap: 8 },
  label: { ...typography.label, color: colors.ink },
  pill: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    backgroundColor: colors.white,
  },
  pillError: { borderColor: colors.danger },
  prefix: { ...typography.body, color: colors.ink },
  sep: {
    width: 1,
    height: 22,
    backgroundColor: colors.borderInput,
    marginHorizontal: 14,
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: colors.ink,
    fontFamily: fontFamily.sans,
    fontSize: 16,
  },
  helper: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    paddingHorizontal: 8,
  },
  error: { color: colors.danger },
  link: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  olive: { ...typography.label, color: colors.olive },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: colors.borderStrong },
  row: { flexDirection: 'row', gap: spacing.md },
  social: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  soon: { opacity: 0.55 },
  socialLabel: { ...typography.label, color: colors.ink },
  soonTag: { ...typography.labelSmall, color: colors.tan },
  center: { textAlign: 'center' },
});
