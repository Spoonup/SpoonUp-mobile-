import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { useBlockBack } from '../../../hooks/useBlockBack';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
import { useCart } from '../../cart/context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { routeAfterStatus } from '../paymentFlow';
import { paymentService } from '../services/paymentService';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentVerify'>;

const POLL_MS = 2000;
const MAX_POLLS = 15;

// The only place a payment can become "successful": the backend says so.
export const PaymentVerifyScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const checkout = useCheckout();
  const queryClient = useQueryClient();

  const status = useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: () => paymentService.getPaymentStatus(orderId),
    gcTime: 0,
    retry: 2,
    refetchInterval: query =>
      query.state.status !== 'error' &&
      query.state.data?.status !== 'paid' &&
      query.state.data?.status !== 'failed' &&
      query.state.dataUpdateCount < MAX_POLLS
        ? POLL_MS
        : false,
  });

  const handled = useRef(false);
  const next = routeAfterStatus(status.data?.status);
  const reference = status.data?.paymentReference;

  useEffect(() => {
    if (handled.current) return;
    if (next === 'confirmed' && reference) {
      handled.current = true;
      cart.clear();
      checkout.reset();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          {
            name: 'OrderConfirmation',
            params: { orderId, paymentReference: reference },
          },
        ],
      });
    } else if (next === 'failed') {
      handled.current = true;
      navigation.replace('PaymentFailed');
    }
  }, [next, reference, orderId, cart, checkout, queryClient, navigation]);

  const polls =
    queryClient.getQueryState(['payment-status', orderId])?.dataUpdateCount ??
    0;
  const timedOut = next === 'wait' && polls >= MAX_POLLS;
  useBlockBack(!status.isError && !timedOut);

  if (status.isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ErrorState
          message="We couldn’t check your payment. Your money is safe. Try again."
          onRetry={() => status.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.body}>
        {timedOut ? null : <ActivityIndicator color={colors.ink} />}
        <Text accessibilityRole="header" style={styles.title}>
          {timedOut ? 'Still confirming' : 'Verifying payment'}
        </Text>
        <Text style={styles.message}>
          {timedOut
            ? 'This is taking longer than usual. You won’t be charged twice. Check again, or see your orders.'
            : 'Please keep this screen open while we confirm your payment.'}
        </Text>
        {timedOut ? (
          <View style={styles.actions}>
            <Button label="Check again" onPress={() => status.refetch()} />
            <Button
              variant="outline"
              label="View my orders"
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs', params: { screen: 'Orders' } }],
                })
              }
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: spacing.xxl,
  },
  title: { ...typography.title, color: colors.ink, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: { gap: spacing.sm, alignSelf: 'stretch', marginTop: spacing.md },
});
