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
import { routeAfterStatus } from '../../checkout/paymentFlow';
import { PLAN_KEY } from '../hooks/usePlan';
import { planService } from '../services/planService';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanVerify'>;

const POLL_MS = 2000;
const MAX_POLLS = 15;

// Same rule as order payments: only the backend can say the plan is paid.
export const PlanVerifyScreen = ({ navigation, route }: Props) => {
  const { planOrderId } = route.params;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const key = ['plan-payment-status', planOrderId];

  const status = useQuery({
    queryKey: key,
    queryFn: () => planService.getPaymentStatus(planOrderId),
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
  const polls = queryClient.getQueryState(key)?.dataUpdateCount ?? 0;
  const timedOut = next === 'wait' && polls >= MAX_POLLS;
  useBlockBack(!status.isError && !timedOut);

  useEffect(() => {
    if (handled.current) return;
    if (next === 'confirmed' && reference) {
      handled.current = true;
      queryClient.invalidateQueries({ queryKey: PLAN_KEY });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs', params: { screen: 'Plans' } },
          { name: 'PlanSuccess', params: { paymentReference: reference } },
        ],
      });
    } else if (next === 'failed') {
      handled.current = true;
      navigation.replace('PlanFailed');
    }
  }, [next, reference, queryClient, navigation]);

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
            ? 'This is taking longer than usual. You won’t be charged twice. Check again, or come back to your plan later.'
            : 'Please keep this screen open while we confirm your payment.'}
        </Text>
        {timedOut ? (
          <View style={styles.actions}>
            <Button label="Check again" onPress={() => status.refetch()} />
            <Button
              variant="outline"
              label="Go to my plan"
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs', params: { screen: 'Plans' } }],
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
