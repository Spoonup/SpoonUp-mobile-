import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useRefresh } from '../../../hooks/useRefresh';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, radius, typography } from '../../../theme';
import { formatMoney } from '../../../utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { ReferralCard } from '../components/ReferralCard';
import { useCreditStatement } from '../hooks/useCredit';
import { txnLabel } from '../logic';

type Props = NativeStackScreenProps<RootStackParamList, 'Credit'>;

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// SpoonUp credit: current amount + activity from GET /api/me/store-credit
// (website Account > Store credit). Refunds and referral rewards add to it;
// orders use it.
export const CreditScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError, refetch } =
    useCreditStatement(isAuthenticated);
  const pull = useRefresh(refetch);
  const header = <ScreenHeader title="SpoonUp credit" onBack={navigation.goBack} />;

  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          title="Log in to see your credit"
          message="Credit is tied to your account."
          actionLabel="Log in"
          onAction={() => navigation.navigate('Auth')}
        />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <ErrorState onRetry={() => refetch()} />
      </View>
    );
  }
  const txns = [...(data?.transactions ?? [])].reverse();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl {...pull} />}
      >
        {isLoading || !data ? (
          <Skeleton height={110} />
        ) : (
          <View style={styles.hero}>
            <Text style={styles.kicker}>AVAILABLE CREDIT</Text>
            <Text style={styles.amount}>{formatMoney(data.available)}</Text>
            <Text style={styles.heroNote}>
              Credited from refunds and referral rewards. Use it on a future
              order here. It has no cash value and can’t be paid out.
            </Text>
          </View>
        )}
        <ReferralCard />
        <Text style={styles.kicker}>ACTIVITY</Text>
        {isLoading ? (
          <Skeleton height={64} />
        ) : txns.length === 0 ? (
          <Text style={styles.empty}>No credit activity yet.</Text>
        ) : (
          <View style={styles.list}>
            {txns.map((t, i) => (
              <View key={t.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{txnLabel(t)}</Text>
                  <Text style={styles.rowSub} numberOfLines={2}>
                    {date(t.createdAt)}
                    {t.reason ? ` · ${t.reason}` : ''}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.rowAmt,
                    t.direction === 'CREDIT' && styles.plus,
                  ]}
                >
                  {t.direction === 'CREDIT' ? '+' : '−'}
                  {formatMoney(t.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: 14, padding: 20, paddingTop: 0 },
  hero: {
    gap: 6,
    padding: 18,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceMuted,
  },
  kicker: { ...typography.kicker, fontSize: 11, color: colors.textMuted },
  amount: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 32,
    color: colors.ink,
  },
  heroNote: { ...typography.bodySmall, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    padding: 14,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { ...typography.heading, color: colors.ink },
  rowSub: { ...typography.bodySmall, color: colors.textSecondary },
  rowAmt: { ...typography.heading, color: colors.ink },
  plus: { color: colors.olive },
});
