import { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../theme';
import type { RootStackParamList } from '../../../navigation/types';
import { useAuth } from '../context/AuthContext';
import { AuthHeader } from '../components/AuthHeader';
import { DoneStep } from '../components/DoneStep';
import { OtpStep } from '../components/OtpStep';
import { PhoneStep } from '../components/PhoneStep';
import { ProfileStep } from '../components/ProfileStep';
import { WelcomeStep } from '../components/WelcomeStep';
import { useKeyboardVisible } from '../../../hooks/useKeyboardVisible';
import { useAuthFlow } from '../hooks/useAuthFlow';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export const AuthScreen = ({ navigation, route }: Props) => {
  const flow = useAuthFlow();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const returnTo = route.params?.returnTo;
  // Skip: guests enter the app; a login started from the cart goes back.
  const skip = () =>
    returnTo ? navigation.goBack() : navigation.replace('MainTabs');
  // After sign-in, resume the interrupted step (cart is preserved in context).
  const finishSignIn = () => {
    signIn({ name: flow.name.trim(), phone: flow.phone });
    if (returnTo) {
      navigation.reset({
        index: 1,
        routes: [{ name: 'MainTabs' }, { name: returnTo }],
      });
    } else {
      navigation.replace('MainTabs');
    }
  };
  // Set by HelpSignIn "Use a different number": back to the phone step.
  const resetPhone = route.params?.resetPhone;
  const { setStep } = flow;
  useEffect(() => {
    if (!resetPhone) return;
    setStep('phone');
    navigation.setParams({ resetPhone: undefined });
  }, [resetPhone, setStep, navigation]);
  const showHeader = flow.stepNumber > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: (keyboardVisible ? 0 : insets.bottom) + spacing.md,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        {showHeader ? (
          <AuthHeader stepNumber={flow.stepNumber} onBack={flow.goBack} />
        ) : null}

        <View style={styles.flex}>
          {flow.step === 'welcome' ? (
            <WelcomeStep
              onContinuePhone={() => flow.setStep('phone')}
              onSkip={skip}
              onTrackOrder={() => navigation.navigate('GuestTracking')}
            />
          ) : null}
          {flow.step === 'phone' ? (
            <PhoneStep
              phone={flow.phone}
              onPhoneChange={flow.setPhone}
              valid={flow.phoneValid}
              busy={flow.busy}
              onSubmit={flow.sendCode}
            />
          ) : null}
          {flow.step === 'otp' ? (
            <OtpStep
              phone={flow.phone}
              otp={flow.otp}
              onOtpChange={flow.submitOtp}
              error={flow.otpError}
              busy={flow.busy}
              resendIn={flow.resendIn}
              onResend={flow.resendCode}
              onChangeNumber={flow.goBack}
              onHelp={() =>
                navigation.navigate('HelpSignIn', { phone: flow.phone })
              }
            />
          ) : null}
          {flow.step === 'profile' ? (
            <ProfileStep
              name={flow.name}
              onNameChange={flow.setName}
              pincode={flow.pincode}
              onPincodeChange={flow.setPincode}
              pincodeInfo={flow.pincodeInfo}
              pincodeComplete={flow.pincode.length === 6}
              referralCode={flow.referralCode}
              onReferralChange={flow.setReferralCode}
              showReferral={flow.showReferral}
              onOpenReferral={flow.openReferral}
              valid={flow.profileValid}
              busy={flow.busy}
              error={flow.submitError}
              onSubmit={flow.finishProfile}
            />
          ) : null}
          {flow.step === 'done' ? (
            <DoneStep
              firstName={flow.name.trim().split(' ')[0] || 'there'}
              onStart={finishSignIn}
            />
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
  },
});
