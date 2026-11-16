import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { formatMoney, formatRupees } from '../../../utils/money';
import { mocksEnabled } from '../../../services/api/mode';
import { useAuth } from '../../auth/context/AuthContext';
import { AddressCard } from '../../checkout/components/AddressCard';
import { useCheckout } from '../../checkout/context/CheckoutContext';
import { useAddresses } from '../../checkout/hooks/useAddresses';
import { EmptyState } from '../../../components/common/EmptyState';
import { friendlyError } from '../../checkout/errorMessage';
import { routeAfterSdk } from '../../checkout/paymentFlow';
import { CreditToggle } from '../../credit/components/CreditToggle';
import { useCreditOffer } from '../../credit/hooks/useCredit';
import { usePlan } from '../hooks/usePlan';
import { planService } from '../services/planService';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanPayment'>;

export const PlanPaymentScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const plan = usePlan();
  const { user } = useAuth();
  const live = !mocksEnabled;
  const { productId, frequency } = route.params ?? {};
  const addresses = useAddresses();
  const { addressId } = useCheckout();
  const address =
    addresses.data?.find(item => item.id === addressId) ?? addresses.data?.[0];
  // Live: the backend prices the chosen plan (cart quote).
  const quote = useQuery({
    queryKey: ['plan-quote', productId, frequency],
    queryFn: () => planService.quote(productId as string, frequency as string),
    enabled: live && !!productId && !!frequency,
  });
  const creditOffer = useCreditOffer(live ? quote.data?.total : undefined);
  // One key per payment screen: taps and retries reuse the same plan order.
  const [idempotencyKey] = useState(planService.newIdempotencyKey);

  const pay = useMutation({
    mutationFn: async () => {
      const intent = await planService.createPlanIntent(
        idempotencyKey,
        live && productId && frequency && address
          ? {
              productId,
              frequency,
              address,
              creditAmount: creditOffer.applied,
              customer: {
                name: user?.name ?? address.name,
                phone: address.phone || user?.phone || '',
                email: user?.email ?? '',
              },
            }
          : undefined,
      );
      return {
        intent,
        outcome: await planService.startPayment(intent, () =>
          navigation.navigate('RazorpayCheckout'),
        ),
      };
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
  const price = live ? quote.data?.total : offer?.price;
  const validityDays = live ? quote.data?.validityDays : offer?.validityDays;
  const ready = live ? !!quote.data && !!address : !!offer;

  if (live && (!productId || !frequency)) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Plan payment" onBack={navigation.goBack} />
        <EmptyState
          title="Choose a plan first"
          message="Pick a dish and how often you want it on the plan tab."
          actionLabel="Choose a plan"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Plans' })}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Plan payment" onBack={navigation.goBack} />
      {plan.isError || quote.isError ? (
        <ErrorState onRetry={live ? quote.refetch : plan.refetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {price !== undefined ? (
            <View style={styles.card}>
              <Text style={styles.label}>30-day plan</Text>
              <Text style={styles.price}>{formatRupees(price)}</Text>
              <Text style={styles.note}>
                One-time payment · valid {validityDays} days · no automatic
                renewal
              </Text>
            </View>
          ) : (
            <Skeleton height={110} borderRadius={radius.lg} />
          )}
          {live ? (
            address ? (
              <AddressCard address={address} />
            ) : (
              <Button
                variant="outline"
                label="Add a delivery address"
                onPress={() => navigation.navigate('AddressForm')}
              />
            )
          ) : null}
          <CreditToggle offer={creditOffer} />
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
          label={
            price !== undefined
              ? `Pay ${formatMoney(price - creditOffer.applied)}`
              : 'Pay'
          }
          onPress={() => pay.mutate()}
          loading={pay.isPending}
          disabled={!ready || offline}
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
    fontFamily: fontFamily.sansMedium,
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
