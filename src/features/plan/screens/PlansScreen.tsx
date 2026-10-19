import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRefresh } from '../../../hooks/useRefresh';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { Skeleton } from '../../../components/common/Skeleton';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../../navigation/types';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { daysLeftLabel, formatPlanDate } from '../logic';
import { usePlan } from '../hooks/usePlan';
import type { Plan } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Plans'>,
  NativeStackScreenProps<RootStackParamList>
>;

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

// Plan Details (none) and Renew (expired): both are a new one-time purchase.
const Offer = ({
  plan,
  expired,
  onBuy,
}: {
  plan: Plan;
  expired: boolean;
  onBuy: () => void;
}) => (
  <>
    <View style={styles.hero}>
      <Text style={styles.kicker}>30-DAY PLAN · PAID ONCE</Text>
      <Text style={styles.heroTitle}>
        {expired ? 'Your plan has ended' : 'One payment. 30 days.'}
      </Text>
      <Text style={styles.price}>{formatRupees(plan.offer.price)}</Text>
      <Text style={styles.heroSub}>
        Valid for {plan.offer.validityDays} days from activation
      </Text>
    </View>
    {expired && plan.expiresAt ? (
      <View style={styles.card}>
        <Row label="Ended on" value={formatPlanDate(plan.expiresAt)} />
        <Text style={styles.note}>
          Renewing is a new one-time purchase. Nothing is charged automatically.
        </Text>
      </View>
    ) : null}
    <View style={styles.card}>
      <Text style={styles.cardTitle}>What you get</Text>
      {plan.offer.benefits.map(benefit => (
        <Text key={benefit} style={styles.benefit}>
          ✓ {benefit}
        </Text>
      ))}
    </View>
    <Text style={styles.note}>
      Your plan starts only after we verify your payment.
    </Text>
    <Button
      label={`${expired ? 'Renew' : 'Buy plan'} · ${formatRupees(
        plan.offer.price,
      )}`}
      onPress={onBuy}
    />
  </>
);

const Active = ({ plan, onSupport }: { plan: Plan; onSupport: () => void }) => (
  <>
    <View style={styles.hero}>
      <Text style={styles.kicker}>30-DAY PLAN · ACTIVE</Text>
      <Text style={styles.heroTitle}>{daysLeftLabel(plan.daysLeft)}</Text>
      <Text style={styles.heroSub}>
        Ends on {plan.expiresAt ? formatPlanDate(plan.expiresAt) : ''}
      </Text>
    </View>
    <View style={styles.card}>
      <Row
        label="Started"
        value={plan.startsAt ? formatPlanDate(plan.startsAt) : ''}
      />
      <Row
        label="Expires"
        value={plan.expiresAt ? formatPlanDate(plan.expiresAt) : ''}
      />
      <Row label="Days left" value={String(plan.daysLeft)} />
      <Row label="Payment reference" value={plan.paymentReference ?? ''} />
    </View>
    <Button variant="outline" label="Help with my plan" onPress={onSupport} />
  </>
);

export const PlansScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError, refetch } = usePlan();
  const pull = useRefresh(refetch);

  // Guests can read the offer; buying needs an account, then resumes here.
  const buy = () =>
    isAuthenticated
      ? navigation.navigate('PlanPayment')
      : navigation.navigate('Auth', { returnTo: 'PlanPayment' });
  const support = () =>
    isAuthenticated
      ? navigation.navigate('Support')
      : navigation.navigate('Auth', { returnTo: 'Support' });

  const renderBody = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton height={150} borderRadius={radius.lg} />
          <Skeleton height={120} borderRadius={radius.lg} />
        </>
      );
    }
    if (isError || !data) {
      return (
        <ErrorState
          message="We couldn’t load your plan. Check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    const status = isAuthenticated ? data.status : 'none';
    if (status === 'active') return <Active plan={data} onSupport={support} />;
    return <Offer plan={data} expired={status === 'expired'} onBuy={buy} />;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text accessibilityRole="header" style={styles.title}>
        30-day plan
      </Text>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...pull} />}
      >
        {renderBody()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  title: {
    ...typography.title,
    color: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  content: { gap: spacing.md, padding: spacing.xl },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: 6,
  },
  kicker: { ...typography.kicker, color: colors.sage },
  heroTitle: { ...typography.title, color: colors.onDark },
  // Instrument Serif has no ₹ glyph; the fallback font garbled the digits.
  price: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.onDark,
  },
  heroSub: { ...typography.bodySmall, color: colors.onDarkMuted },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: { ...typography.heading, color: colors.ink },
  benefit: { ...typography.body, color: colors.ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { ...typography.bodySmall, color: colors.textSecondary },
  rowValue: {
    ...typography.label,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  note: { ...typography.bodySmall, color: colors.textSecondary },
});
