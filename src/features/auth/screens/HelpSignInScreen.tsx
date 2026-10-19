import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
import { authService } from '../services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSignIn'>;

const COOLDOWN_SECONDS = 30;

// Sign-in is phone + OTP, so "forgot password" is code and number trouble.
export const HelpSignInScreen = ({ navigation, route }: Props) => {
  const { phone } = route.params;
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const phoneValid = /^\d{10}$/.test(phone);
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    if (!phoneValid || busy || cooldown > 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await authService.sendOtp(phone);
      setCooldown(COOLDOWN_SECONDS);
      setMessage('We sent a new code. It can take a minute to arrive.');
    } catch {
      setMessage('Couldn’t send the code. Check your connection and retry.');
    } finally {
      setBusy(false);
    }
  };

  const changeNumber = () =>
    navigation.popTo('Auth', { resetPhone: true }, { merge: true });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Trouble signing in?" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>
          {phoneValid
            ? `We send a 6-digit code to +91 ${phone}. Make sure you have signal and the number is right.`
            : 'That phone number doesn’t look right. Enter a 10-digit number to get a code.'}
        </Text>
        {message ? (
          <Text accessibilityLiveRegion="polite" style={styles.status}>
            {message}
          </Text>
        ) : null}
        <Button
          label={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          onPress={resend}
          loading={busy}
          disabled={!phoneValid || cooldown > 0 || offline}
        />
        <Button
          variant="outline"
          label="Use a different number"
          onPress={changeNumber}
        />
        <Text style={styles.text}>
          Still stuck? You can keep browsing as a guest and track an order with
          its tracking reference. After you sign in, contact SpoonUp support
          from the Account tab.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  text: { ...typography.body, color: colors.textSecondary },
  status: { ...typography.label, color: colors.olive },
});
