import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { TextField } from '../../../components/common/TextField';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { trackingError } from '../errorMessage';
import {
  guestOrderService,
  type GuestOrderStatus,
} from '../services/guestOrderService';
import { normalizeReference, validateReference } from '../tracking';

type Props = NativeStackScreenProps<RootStackParamList, 'GuestTracking'>;

export const GuestTrackingScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const busy = useRef(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<GuestOrderStatus>();

  const submit = async () => {
    if (busy.current) return;
    const invalid = validateReference(value);
    setResult(undefined);
    setError(invalid);
    if (invalid) return;
    busy.current = true;
    setLoading(true);
    try {
      const reference = normalizeReference(value);
      setValue(reference);
      setResult(await guestOrderService.trackGuestOrder(reference));
    } catch (e) {
      setError(trackingError(e));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Track an order" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>
          Enter the confirmation or tracking reference from your order
          confirmation.
        </Text>
        <TextField
          label="Order reference"
          value={value}
          onChangeText={setValue}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={20}
          error={error}
          returnKeyType="search"
          onSubmitEditing={submit}
        />
        <Button
          label="Track order"
          onPress={submit}
          loading={loading}
          disabled={offline}
        />
        {result ? (
          <View style={styles.card}>
            <Text style={styles.ref}>{result.reference}</Text>
            <Text style={styles.meta}>Placed {result.placedAt}</Text>
            {result.etaText ? (
              <Text accessibilityLiveRegion="polite" style={styles.eta}>
                {result.etaText}
              </Text>
            ) : null}
            <TrackingTimeline status={result.status} />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  hint: { ...typography.body, color: colors.textSecondary },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  ref: { ...typography.heading, color: colors.ink },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  eta: { ...typography.body, color: colors.olive },
});
