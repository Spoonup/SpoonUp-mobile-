import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
import { profileService } from '../services/profileService';
import { validateName } from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const { user, signIn } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [problem, setProblem] = useState<string>();
  const [saved, setSaved] = useState(false);
  const save = useMutation({ mutationFn: profileService.updateName });

  const submit = async () => {
    const found = validateName(name);
    setProblem(found);
    setSaved(false);
    if (found || !user) return;
    try {
      const updated = await save.mutateAsync(name);
      signIn({ ...user, name: updated.name });
      setName(updated.name);
      setSaved(true);
    } catch {
      setProblem(
        'We couldn’t save your changes. Check your connection and retry.',
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
            label="Your name"
            value={name}
            onChangeText={value => {
              setName(value);
              setSaved(false);
            }}
            error={problem}
            autoComplete="name"
            textContentType="name"
            maxLength={60}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <View style={styles.phone}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>+91 {user.phone}</Text>
            <Text style={styles.hint}>
              Your phone number is how you sign in, so it can’t be changed here.
            </Text>
          </View>
          {saved ? (
            <Text accessibilityLiveRegion="polite" style={styles.saved}>
              Profile updated.
            </Text>
          ) : null}
          <Button
            label="Save changes"
            onPress={submit}
            loading={save.isPending}
            disabled={offline || name.trim() === user.name}
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
  phone: { gap: 4 },
  label: { ...typography.label, color: colors.ink },
  value: { ...typography.heading, fontSize: 16, color: colors.ink },
  hint: { ...typography.bodySmall, color: colors.textSecondary },
  saved: { ...typography.label, color: colors.olive },
});
