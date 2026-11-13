import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BillSummary } from '../../../components/common/BillSummary';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { AddressCard } from '../components/AddressCard';
import { Section } from '../components/Section';
import { useAuth } from '../../auth/context/AuthContext';
import { friendlyError } from '../errorMessage';
import { useCheckoutDraft } from '../hooks/useCheckoutDraft';
import { routeAfterSdk } from '../paymentFlow';
import { paymentService } from '../services/paymentService';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export const PaymentScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const { user } = useAuth();
  const { lines, checkout, address, option, quote } = useCheckoutDraft();
  // One key per payment screen: taps and retries reuse the same order.
  const [idempotencyKey] = useState(paymentService.newIdempotencyKey);

  const pay = useMutation({
    mutationFn: async () => {
      const intent = await paymentService.createOrderIntent({
        lines,
        address: address!,
        option: option!,
        couponCode: checkout.couponCode,
        idempotencyKey,
        // Recipient name/phone when known; account email is the backend's
        // fallback for the receipt.
        customer: {
          name:
            address!.name.trim().length >= 2 ? address!.name : user?.name ?? '',
          phone: address!.phone || user?.phone || '',
          email: user?.email ?? '',
        },
      });
      return {
        intent,
        outcome: await paymentService.startPayment(intent, () =>
          navigation.navigate('RazorpayCheckout'),
        ),
      };
    },
    onSuccess: ({ intent, outcome }) => {
      const next = routeAfterSdk(outcome);
      if (next === 'verify') {
        navigation.navigate('PaymentVerify', { orderId: intent.orderId });
      } else if (next === 'failed') {
        navigation.navigate('PaymentFailed');
      } else {
        navigation.navigate('PaymentCancelled');
      }
    },
  });

  const header = <ScreenHeader title="Payment" onBack={navigation.goBack} />;

  if (!address || !option || lines.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          title="Finish checkout first"
          message="Choose an address and delivery option before paying."
          actionLabel="Back to checkout"
          onAction={() => navigation.navigate('Checkout')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <Section step={2} title="Delivering to">
          <AddressCard address={address} />
          <Text style={styles.note}>
            {option.label} · {option.detail}
          </Text>
        </Section>
        <Section step={6} title="Payment">
          <View style={styles.payCard}>
            <Text style={styles.payTitle}>Pay online</Text>
            <Text style={styles.note}>UPI, card or netbanking</Text>
          </View>
        </Section>
        <Section title="Your order">
          {quote.data ? (
            <BillSummary summary={quote.data} />
          ) : (
            <Skeleton height={64} />
          )}
        </Section>
        <Text style={styles.note}>
          Your order is confirmed only after we verify the payment with your
          bank.
        </Text>
        {pay.isError ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {friendlyError(pay.error, 'Couldn’t start the payment. Try again.')}
          </Text>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label={
            quote.data && !quote.data.finalAtPayment
              ? `Pay ${formatRupees(quote.data.total)}`
              : 'Pay'
          }
          onPress={() => pay.mutate()}
          loading={pay.isPending}
          disabled={!quote.data || offline}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.xxl, padding: spacing.xl },
  payCard: {
    gap: 2,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.olive,
    backgroundColor: colors.selectedBg,
  },
  payTitle: { ...typography.label, color: colors.ink },
  note: { ...typography.bodySmall, color: colors.textSecondary },
  error: { ...typography.label, color: colors.danger },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
