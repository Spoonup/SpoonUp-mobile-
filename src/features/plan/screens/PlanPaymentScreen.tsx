import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { friendlyError } from '../../checkout/errorMessage';
import { routeAfterSdk } from '../../checkout/paymentFlow';
import { usePlan } from '../hooks/usePlan';
import { planService } from '../services/planService';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanPayment'>;

export const PlanPaymentScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const plan = usePlan();
  // One key per payment screen: taps and retries reuse the same plan order.
  const [idempotencyKey] = useState(planService.newIdempotencyKey);

  const pay = useMutation({
    mutationFn: async () => {
      const intent = await planService.createPlanIntent(idempotencyKey);
      return { intent, outcome: await planService.startPayment(intent) };
    },
    onSuccess: ({ intent, outcome }) => {
      const next = routeAfterSdk(outcome);
      if (next === 'verify') {
        navigation.navigate('PlanVerify', { planOrderId: intent.planOrderId });
      } else if (next === 'failed') {
        navigation.navigate('PlanFailed');
      } else {
        navigation.navigate('PlanCancelled');
      }
    },
  });

  const offer = plan.data?.offer;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Plan payment" onBack={navigation.goBack} />
      {plan.isError ? (
        <ErrorState onRetry={plan.refetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {offer ? (
            <View style={styles.card}>
              <Text style={styles.label}>30-day plan</Text>
              <Text style={styles.price}>{formatRupees(offer.price)}</Text>
              <Text style={styles.note}>
                One-time payment · valid {offer.validityDays} days · no
                automatic renewal
              </Text>
            </View>
          ) : (
            <Skeleton height={110} borderRadius={radius.lg} />
          )}
          <Text style={styles.note}>
            Your plan starts only after we verify the payment with your bank.
          </Text>
          {pay.isError ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {friendlyError(
                pay.error,
                'Couldn’t start the payment. Try again.',
              )}
            </Text>
          ) : null}
        </ScrollView>
      )}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label={offer ? `Pay ${formatRupees(offer.price)}` : 'Pay'}
          onPress={() => pay.mutate()}
          loading={pay.isPending}
          disabled={!offer || offline}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: 4,
  },
  label: { ...typography.label, color: colors.textSecondary },
  // Instrument Serif has no ₹ glyph; the fallback font garbled the digits.
  price: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
  },
  note: { ...typography.bodySmall, color: colors.textSecondary },
  error: { ...typography.label, color: colors.danger },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
