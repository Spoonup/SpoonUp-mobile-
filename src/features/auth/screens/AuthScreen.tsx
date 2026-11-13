import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { MobileLogin } from '../components/MobileLogin';
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
type Mode = 'mobile' | 'signin' | 'signup';
type Errors = Partial<
  Record<'identifier' | 'username' | 'email' | 'phone' | 'password', string>
>;

// Mirrors the website's /signin page: one screen, Sign in / Create account
// toggle, username-or-email + password. Facebook and Apple are "soon" there
// too. Google on the web is a browser redirect, so it is not offered here.
export const AuthScreen = ({ navigation, route }: Props) => {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const returnTo = route.params?.returnTo;

  const [mode, setMode] = useState<Mode>('mobile');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  // DECISION: matches website, differs from CLAUDE.md: the site's sign-up has
  // an optional referral code; CLAUDE.md has no referral. Backend applies it.
  const [referral, setReferral] = useState('');
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

  const mobile = mode === 'mobile';
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {mobile ? (
          <MobileLogin
            offline={offline}
            onSignedIn={session => {
              signIn(session);
              finish();
            }}
            onUseEmail={() => switchMode('signin')}
            onSignup={() => switchMode('signup')}
            onSkip={skip}
          />
        ) : (
          <>
            <Image
              source={require('../../../assets/images/spoonup-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="SpoonUp"
            />
            <Text style={styles.kicker}>
              {signup ? 'NEW HERE' : 'WELCOME BACK'}
            </Text>
            <Text accessibilityRole="header" style={styles.h1}>
              {signup
                ? 'Create your SpoonUp account'
                : 'Sign in to your SpoonUp account'}
            </Text>
            <Text style={styles.lead}>
              Track live orders, manage your plans, and reorder favourites. One
              account across web and app.
            </Text>

            <View style={styles.toggle}>
              <View style={styles.flex}>
                <Button
                  label="Sign in"
                  variant={signup ? 'outline' : 'dark'}
                  onPress={() => switchMode('signin')}
                />
              </View>
              <View style={styles.flex}>
                <Button
                  label="Create account"
                  variant={signup ? 'dark' : 'outline'}
                  onPress={() => switchMode('signup')}
                />
              </View>
            </View>

            <View style={styles.form}>
              {signup ? (
                <>
                  <TextField
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
                <TextField
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
              label={signup ? 'Create account' : 'Sign in'}
              onPress={submit}
              loading={busy}
              disabled={offline}
            />
            {signup ? null : (
              <Pressable
                accessibilityRole="button"
                onPress={() => switchMode('mobile')}
                hitSlop={8}
                style={styles.link}
              >
                <Text style={styles.linkText}>Use mobile number instead</Text>
              </Pressable>
            )}
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

            <View style={styles.toggle}>
              <View style={styles.flex}>
                <Button
                  label="Facebook · soon"
                  variant="outline"
                  disabled
                  onPress={() => {}}
                />
              </View>
              <View style={styles.flex}>
                <Button
                  label="Apple · soon"
                  variant="outline"
                  disabled
                  onPress={() => {}}
                />
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={skip}
              hitSlop={8}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                Just browsing? Continue as guest
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Track an order"
              onPress={() => navigation.navigate('GuestTracking')}
              hitSlop={8}
              style={styles.link}
            >
              <Text style={styles.linkText}>Track an order</Text>
            </Pressable>
            <Text style={styles.terms}>
              By continuing you accept our Terms and Privacy Policy.
            </Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
  },
  logo: { width: 120, height: 36 },
  kicker: { ...typography.kicker, color: colors.tanDark },
  h1: { ...typography.display, color: colors.ink },
  lead: { ...typography.body, color: colors.textSecondary },
  toggle: { flexDirection: 'row', gap: spacing.sm },
  form: { gap: spacing.md },
  error: { ...typography.label, color: colors.danger },
  hintText: { ...typography.labelSmall, color: colors.tan },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  linkText: { ...typography.label, color: colors.olive },
  terms: {
    ...typography.labelSmall,
    fontFamily: fontFamily.sans,
    color: colors.textDisabled,
    textAlign: 'center',
  },
});
