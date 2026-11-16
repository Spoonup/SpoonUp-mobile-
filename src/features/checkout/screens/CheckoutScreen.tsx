import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BillSummary } from '../../../components/common/BillSummary';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { CreditToggle } from '../../credit/components/CreditToggle';
import { useCreditOffer } from '../../credit/hooks/useCredit';
import { payableBeforeCredit, withCredit } from '../../credit/logic';
import { friendlyError } from '../errorMessage';
import { useCheckoutDraft } from '../hooks/useCheckoutDraft';
import { routeAfterSdk } from '../paymentFlow';
import { paymentService } from '../services/paymentService';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

// Mockup 6d2. Payment starts from this screen (the old separate Payment step
// is gone). DECISION: only Razorpay is listed. The website hides Cashfree and
// has no cash on delivery (`paymentMethod` is always 'online'). SpoonUp credit
// is sent as `storeCreditAmount`; the backend clamps it and returns the final
// charge.
// TODO(api): add Cashfree / COD rows when the backend supports them.
export const CheckoutScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const offline = useOffline();
  const { user } = useAuth();
  const { lines, checkout, addresses, address, option, quote } =
    useCheckoutDraft();
  const offer = useCreditOffer(
    quote.data ? payableBeforeCredit(quote.data) : undefined,
  );
  // One key per checkout screen: taps and retries reuse the same order.
  const [idempotencyKey] = useState(paymentService.newIdempotencyKey);

  const pay = useMutation({
    mutationFn: async () => {
      const intent = await paymentService.createOrderIntent({
        lines,
        address: address!,
        option: option!,
        couponCode: checkout.couponCode,
        creditAmount: offer.applied,
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
        navigation.navigate('PaymentFailed', {
          amount: intent.amount,
          reference: intent.orderId,
          reason: 'Payment didn’t go through',
        });
      } else {
        navigation.navigate('PaymentCancelled', { amount: intent.amount });
      }
    },
  });

  const header = <ScreenHeader title="Checkout" onBack={navigation.goBack} />;

  if (lines.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          title="Your cart is empty"
          message="Add something before checking out."
          actionLabel="Browse the shop"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
        />
      </View>
    );
  }

  const renderAddress = () => {
    if (addresses.isError) {
      return (
        <Button
          variant="outline"
          label="Couldn’t load addresses. Retry"
          onPress={() => addresses.refetch()}
        />
      );
    }
    if (addresses.isLoading) return <Skeleton height={64} />;
    if (!address) {
      return (
        <Button
          variant="outline"
          label="Add a delivery address"
          onPress={() => navigation.navigate('AddressForm')}
        />
      );
    }
    return (
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.kicker}>DELIVER TO</Text>
          <Text style={styles.addr}>{address.line1}</Text>
          <Text style={styles.sub}>
            {address.city} · {address.pincode}
            {option ? ` · ${option.label}` : ''}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change address"
          onPress={() => navigation.navigate('Addresses', { select: true })}
          style={styles.change}
        >
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>
    );
  };

  const renderSummary = () => {
    if (quote.isError) {
      return (
        <Button
          variant="outline"
          label="Couldn’t load totals. Retry"
          onPress={() => quote.refetch()}
        />
      );
    }
    if (!quote.data) {
      return address && option ? (
        <Skeleton height={64} />
      ) : (
        <Text style={styles.sub}>
          Choose an address and delivery option to see your total.
        </Text>
      );
    }
    return <BillSummary summary={withCredit(quote.data, offer.applied)} />;
  };

  const total = quote.data && withCredit(quote.data, offer.applied);
  const payLabel =
    total && !total.finalAtPayment
      ? `Pay ${formatRupees(total.total)} with Razorpay`
      : 'Pay with Razorpay';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>{renderAddress()}</View>
        <Text style={styles.kicker}>PAY ONLINE</Text>
        <View style={styles.card}>
          <View
            accessibilityRole="radio"
            accessibilityState={{ selected: true }}
            accessibilityLabel="Razorpay, UPI, cards, netbanking"
            style={[styles.row, styles.selected]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>R</Text>
            </View>
            <View style={styles.rowText}>
              <Text style={styles.addr}>Razorpay</Text>
              <Text style={styles.sub}>UPI, cards, netbanking</Text>
            </View>
            <View style={styles.radio}>
              <View style={styles.radioDot} />
            </View>
          </View>
        </View>
        <CreditToggle offer={offer} />
        {renderSummary()}
        {pay.isError ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {friendlyError(pay.error, 'Couldn’t start the payment. Try again.')}
          </Text>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <Text style={styles.footNote}>
          You’ll finish paying on Razorpay. Your order is confirmed only after
          we verify the payment.
        </Text>
        <Button
          variant="dark"
          label={payLabel}
          onPress={() => pay.mutate()}
          loading={pay.isPending}
          disabled={!quote.data || !address || !option || offline}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl, paddingTop: 0 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowText: { flex: 1, gap: 3 },
  selected: { backgroundColor: colors.surfaceMuted },
  kicker: { ...typography.kicker, fontSize: 11, color: colors.textMuted },
  addr: { ...typography.heading, color: colors.ink },
  sub: { ...typography.bodySmall, color: colors.textSecondary },
  change: { minWidth: 48, minHeight: 48, justifyContent: 'center' },
  changeText: { ...typography.label, color: colors.olive },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14214F',
  },
  badgeText: { ...typography.heading, color: colors.onDark },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.olive,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.onDark,
  },
  error: { ...typography.label, color: colors.danger },
  footer: {
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footNote: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
