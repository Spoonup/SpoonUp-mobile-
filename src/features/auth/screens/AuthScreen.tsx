import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { AppleIcon, GoogleIcon } from '../../../components/common/Icon';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import { TextField } from '../../../components/common/TextField';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import { useAuth } from '../context/AuthContext';
import { AuthError, authService } from '../services/authService';
import {
  phoneDigits,
  validateEmail,
  validateIdentifier,
  validateLoginPassword,
  validateNewPassword,
  validatePhone,
  validateUsername,
} from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;
type Mode = 'signin' | 'signup';
type Errors = Partial<
  Record<'identifier' | 'username' | 'email' | 'phone' | 'password', string>
>;

// Mockup 6a layout with the backend's real method: username-or-email +
// password (the backend has no phone-OTP). One screen, Sign in / Create
// account switch. Google on the web is a browser redirect, so it is not
// offered here.
export const AuthScreen = ({ navigation, route }: Props) => {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const offline = useOffline();
  const returnTo = route.params?.returnTo;

  const [mode, setMode] = useState<Mode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  // DECISION: matches website, differs from CLAUDE.md: the site's sign-up has
  // an optional referral code; backend applies it.
  const [referral, setReferral] = useState('');
  const [referralOpen, setReferralOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signup = mode === 'signup';
  const switchMode = (next: Mode) => {
    setMode(next);
    setErrors({});
    setFormError(null);
  };

  // Guests enter the app; a login started from the cart/plan goes back.
  const skip = () =>
    returnTo ? navigation.goBack() : navigation.replace('MainTabs');
  // After sign-in, resume the interrupted step (cart is preserved in context).
  const finish = () =>
    returnTo
      ? navigation.reset({
          index: 1,
          routes: [{ name: 'MainTabs' }, { name: returnTo }],
        })
      : navigation.replace('MainTabs');

  const submit = async () => {
    if (busy) return;
    const found: Errors = signup
      ? {
          username: validateUsername(username),
          email: validateEmail(email),
          phone: validatePhone(phone),
          password: validateNewPassword(password),
        }
      : {
          identifier: validateIdentifier(identifier),
          password: validateLoginPassword(password),
        };
    setErrors(found);
    setFormError(null);
    if (Object.values(found).some(Boolean)) return;
    setBusy(true);
    try {
      const session = signup
        ? await authService.signup({
            username,
            email,
            phone: phoneDigits(phone),
            password,
            referralCode: referral.trim() || undefined,
          })
        : await authService.login(identifier, password);
      signIn(session);
      finish();
    } catch (error) {
      setFormError(
        error instanceof AuthError
          ? error.message
          : 'Something went wrong. Try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  // One layout for every mode (mockup 6a). The footer pads for the Android
  // gesture bar, and the keyboard resizes the scroll view so the submit button
  // stays reachable.
  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.xl, paddingBottom: footerPad },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../../../assets/images/spoonup-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="SpoonUp"
          />
          <View style={styles.headBlock}>
            <Text accessibilityRole="header" style={styles.h1}>
              {signup ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.lead}>
              {signup
                ? 'Track live orders, manage your plans and reorder favourites.'
                : 'Sign in to track orders and manage your plans.'}
            </Text>
          </View>

          <View style={styles.form}>
            {signup ? (
              <>
                <TextField
                  pill
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  error={errors.username}
                  hint="3-32 letters, numbers or underscores."
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                  textContentType="username"
                  maxLength={32}
                  returnKeyType="next"
                />
                <TextField
                  pill
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
                <TextField
                  pill
                  label="Mobile number"
                  value={phone}
                  onChangeText={value => setPhone(phoneDigits(value))}
                  error={errors.phone}
                  hint="10 digits, used for delivery updates."
                  keyboardType="number-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  maxLength={10}
                />
              </>
            ) : (
              <TextField
                pill
                label="Username or email"
                value={identifier}
                onChangeText={setIdentifier}
                error={errors.identifier}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
              />
            )}
            <TextField
              pill
              label="Password"
              password
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              hint={signup ? '8-128 characters.' : undefined}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={signup ? 'password-new' : 'password'}
              textContentType={signup ? 'newPassword' : 'password'}
              maxLength={128}
              returnKeyType="go"
              onSubmitEditing={submit}
            />
            {signup ? (
              referralOpen ? (
                <TextField
                  pill
                  label="Referral code (optional)"
                  value={referral}
                  onChangeText={value =>
                    setReferral(
                      value.toUpperCase().replace(/\s/g, '').slice(0, 20),
                    )
                  }
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setReferralOpen(true)}
                  style={styles.refLink}
                >
                  <Text style={styles.linkText}>+ I have a referral code</Text>
                </Pressable>
              )
            ) : null}
          </View>

          {formError ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {formError}
            </Text>
          ) : null}
          {offline ? (
            <Text style={styles.hintText}>
              You are offline. Reconnect to continue.
            </Text>
          ) : null}
          <Button
            variant="dark"
            label={signup ? 'Create account' : 'Sign in'}
            onPress={submit}
            loading={busy}
            disabled={offline}
          />
          {signup ? null : (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('HelpSignIn')}
              hitSlop={8}
              style={styles.link}
            >
              <Text style={styles.linkText}>Forgot your password?</Text>
            </Pressable>
          )}

          <View style={styles.divider}>
            <View style={styles.rule} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.rule} />
          </View>
          {/* Google/Apple stay disabled: the backend has no in-app route for
              either (see AUTH-PLAN.md). */}
          <View style={styles.social}>
            <View
              accessible
              accessibilityState={{ disabled: true }}
              accessibilityLabel="Google, coming soon"
              style={styles.socialBtn}
            >
              <GoogleIcon size={18} />
              <Text style={styles.socialText}>Google · soon</Text>
            </View>
            <View
              accessible
              accessibilityState={{ disabled: true }}
              accessibilityLabel="Apple, coming soon"
              style={styles.socialBtn}
            >
              <AppleIcon color={colors.ink} size={18} />
              <Text style={styles.socialText}>Apple · soon</Text>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {signup ? 'Already have an account?' : 'New to SpoonUp?'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => switchMode(signup ? 'signin' : 'signup')}
              hitSlop={8}
              style={styles.switchBtn}
            >
              <Text style={styles.linkText}>
                {signup ? 'Sign in' : 'Create account'}
              </Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={skip}
            hitSlop={8}
            style={styles.link}
          >
            <Text style={styles.skipText}>Just browsing? Skip for now</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Track an order"
            onPress={() => navigation.navigate('GuestTracking')}
            hitSlop={8}
            style={styles.link}
          >
            <Text style={styles.skipText}>Track an order</Text>
          </Pressable>
          <Text style={styles.terms}>
            By continuing you accept our Terms and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  logo: { width: 150, height: 56, alignSelf: 'center' },
  headBlock: { alignSelf: 'stretch', gap: 6, marginVertical: 6 },
  h1: {
    fontFamily: fontFamily.serif,
    fontSize: 32,
    lineHeight: 35,
    color: colors.ink,
    textAlign: 'center',
  },
  lead: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: { gap: 12 },
  error: { ...typography.label, color: colors.danger },
  hintText: { ...typography.labelSmall, color: colors.tan },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  refLink: { minHeight: 44, justifyContent: 'center', paddingLeft: 4 },
  linkText: { ...typography.label, color: colors.olive },
  skipText: { ...typography.labelSmall, color: colors.textMuted },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerText: { ...typography.labelSmall, color: colors.textMuted },
  social: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    opacity: 0.55,
  },
  socialText: { ...typography.label, color: colors.ink },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  switchText: { ...typography.bodySmall, color: colors.textSecondary },
  switchBtn: { minHeight: 44, justifyContent: 'center' },
  terms: {
    ...typography.labelSmall,
    fontFamily: fontFamily.sans,
    color: colors.textDisabled,
    textAlign: 'center',
  },
});
