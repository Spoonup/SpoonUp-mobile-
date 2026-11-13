import {
  Image,
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
import { mocksEnabled } from '../../../services/api/mode';
import { useAuth } from '../../auth/context/AuthContext';
import { PlanBuilder } from '../components/PlanBuilder';
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
    <View style={styles.intro}>
      <Text style={styles.kickerDark}>SCHEDULE PLAN</Text>
      <Text style={styles.h1}>
        {expired ? 'Your plan has ended.' : 'Decide once. Then just '}
        {expired ? null : <Text style={styles.h1Italic}>eat</Text>}
        {expired ? null : '.'}
      </Text>
      <Text style={styles.lead}>
        Pay once for the whole plan. Fresh food arrives on your schedule for{' '}
        {plan.offer.validityDays} days.
      </Text>
    </View>
    <View style={styles.stats}>
      <View style={styles.stat}>
        <Text style={styles.statNum}>{plan.offer.validityDays}</Text>
        <Text style={styles.statLabel}>days per pass</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNum}>1</Text>
        <Text style={styles.statLabel}>payment, paid once</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statNum}>0</Text>
        <Text style={styles.statLabel}>fees to pause or skip by email</Text>
      </View>
    </View>
    <Image
      source={require('../../../assets/images/lifestyle/week-jars.jpg')}
      style={styles.photo}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
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
    <View style={styles.summary}>
      <Text style={styles.kickerDark}>YOUR PLAN</Text>
      <Row label="Valid for" value={`${plan.offer.validityDays} days`} />
      <View style={styles.totalRow}>
        <Text style={styles.cardTitle}>Plan price</Text>
        <Text style={styles.total}>{formatRupees(plan.offer.price)}</Text>
      </View>
      <Text style={styles.note}>
        One prepaid payment. It does not renew. Your plan starts only after we
        verify your payment.
      </Text>
    </View>
    {/* DECISION: matches website, differs from CLAUDE.md: the site builds a
        plan (product, frequency, GST) in the cart; the app keeps the fixed
        server-priced plan until the backend exposes the builder. */}
    <Button
      label={`${expired ? 'Renew plan' : 'Start plan'} · ${formatRupees(
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
  const buy = (productId?: string, frequency?: string) =>
    isAuthenticated
      ? navigation.navigate('PlanPayment', { productId, frequency })
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
    if (!mocksEnabled) {
      return (
        <>
          {status === 'expired' && data.expiresAt ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your plan has ended</Text>
              <Row label="Ended on" value={formatPlanDate(data.expiresAt)} />
              <Text style={styles.note}>
                Renewing is a new one-time purchase. Nothing is charged
                automatically.
              </Text>
            </View>
          ) : null}
          <PlanBuilder onStart={buy} />
        </>
      );
    }
    return (
      <Offer plan={data} expired={status === 'expired'} onBuy={() => buy()} />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text accessibilityRole="header" style={styles.title}>
        Schedule plan
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
  content: { gap: spacing.xl, padding: spacing.xl },
  intro: { gap: spacing.md },
  kickerDark: { ...typography.kicker, color: colors.tanDark },
  h1: { ...typography.display, color: colors.ink },
  h1Italic: { fontFamily: fontFamily.serifItalic },
  lead: { ...typography.bodyLarge, color: colors.textSecondary },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, gap: 2 },
  statNum: { ...typography.headline, color: colors.ink },
  statLabel: { ...typography.labelSmall, color: colors.textSecondary },
  photo: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceMuted,
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: 6,
  },
  kicker: { ...typography.kicker, color: colors.sage },
  heroTitle: { ...typography.title, color: colors.onDark },
  heroSub: { ...typography.bodySmall, color: colors.onDarkMuted },
  summary: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    padding: 20,
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  total: { ...typography.amount, color: colors.ink },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
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
