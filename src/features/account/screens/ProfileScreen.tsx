import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { TextField } from '../../../components/common/TextField';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
import { useAuth } from '../../auth/context/AuthContext';
import {
  phoneDigits,
  validateEmail,
  validatePhone,
  validateUsername,
} from '../../auth/validation';
import { ProfileError, profileService } from '../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const { user, signIn } = useAuth();
  const [form, setForm] = useState({
    username: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [formError, setFormError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const save = useMutation({ mutationFn: profileService.update });

  const field = (key: keyof typeof form) => ({
    value: form[key],
    error: errors[key],
    onChangeText: (value: string) => {
      setForm(prev => ({ ...prev, [key]: value }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
      setSaved(false);
    },
  });

  const unchanged =
    !!user &&
    form.username.trim() === user.name &&
    form.email.trim() === user.email &&
    phoneDigits(form.phone) === user.phone;

  // PATCH /api/me needs all three fields together.
  const submit = async () => {
    const found = {
      username: validateUsername(form.username),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
    };
    setErrors(found);
    setFormError(undefined);
    setSaved(false);
    if (Object.values(found).some(Boolean) || !user) return;
    try {
      const updated = await save.mutateAsync({
        username: form.username,
        email: form.email,
        phone: phoneDigits(form.phone),
      });
      signIn(updated);
      setForm({
        username: updated.name,
        email: updated.email,
        phone: updated.phone,
      });
      setSaved(true);
    } catch (error) {
      setFormError(
        error instanceof ProfileError
          ? error.message
          : 'We couldn’t save your changes. Check your connection and retry.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Profile" onBack={navigation.goBack} />
      {user ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="Username"
            {...field('username')}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            maxLength={32}
          />
          <TextField
            label="Email"
            {...field('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            maxLength={254}
          />
          <TextField
            label="Mobile number"
            {...field('phone')}
            keyboardType="number-pad"
            autoComplete="tel"
            maxLength={13}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          {formError ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {formError}
            </Text>
          ) : null}
          {saved ? (
            <Text accessibilityLiveRegion="polite" style={styles.saved}>
              Profile updated.
            </Text>
          ) : null}
          <Button
            label="Save changes"
            onPress={submit}
            loading={save.isPending}
            disabled={offline || unchanged}
          />
        </ScrollView>
      ) : (
        <EmptyState
          title="Sign in to edit your profile"
          message="Your profile lives in your account."
          actionLabel="Log in or sign up"
          onAction={() => navigation.navigate('Auth')}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.lg, padding: spacing.xl },
  error: { ...typography.label, color: colors.danger },
  saved: { ...typography.label, color: colors.olive },
});
