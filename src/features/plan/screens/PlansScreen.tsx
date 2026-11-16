import { useMemo } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRefresh } from '../../../hooks/useRefresh';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AspectImage } from '../../../components/common/AspectImage';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { Skeleton } from '../../../components/common/Skeleton';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../../navigation/types';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import { mocksEnabled } from '../../../services/api/mode';
import { useAuth } from '../../auth/context/AuthContext';
import { useProducts } from '../../shop/hooks/useProducts';
import { formatPlanDate } from '../logic';
import { planService } from '../services/planService';
import { usePlan } from '../hooks/usePlan';
import type { PlanRow } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Plans'>,
  NativeStackScreenProps<RootStackParamList>
>;

const FALLBACK = require('../../../assets/images/products/chia.png');
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

// Next two weeks, Monday-aligned like the mockup, from the plan's own
// deliveries: delivery day = green, skipped = dashed, no delivery = grey.
const twoWeeks = (row: PlanRow, now = new Date()) => {
  const mondayOffset = (now.getDay() + 6) % 7;
  const start = new Date(now.getTime() - mondayOffset * DAY_MS);
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(start.getTime() + i * DAY_MS);
    const hit = (row.deliveries ?? []).find(x => x.scheduledDate === isoDay(d));
    const kind =
      hit?.status === 'SKIPPED'
        ? 'skipped'
        : hit && hit.status !== 'CANCELLED'
        ? 'on'
        : 'off';
    return { key: isoDay(d), day: d.getDate(), kind } as const;
  });
};

const Tag = ({ label, tone }: { label: string; tone: 'on' | 'paused' }) => (
  <Text style={[styles.tag, tone === 'on' ? styles.tagOn : styles.tagPaused]}>
    {label}
  </Text>
);

type CardProps = {
  row: PlanRow;
  name: string;
  image: ImageSourcePropType;
  onHelp: () => void;
};

const ActiveCard = ({ row, name, image, onHelp }: CardProps) => {
  const total = row.deliveryCount ?? row.deliveries?.length ?? 0;
  const done = (row.deliveries ?? []).filter(
    d => d.status === 'DELIVERED',
  ).length;
  const paused = row.status === 'PAUSED';
  return (
    <View style={[styles.card, paused && styles.cardPaused]}>
      <View style={styles.cardHead}>
        <Image source={image} style={styles.thumb} resizeMode="cover" />
        <View style={styles.flex}>
          <Text style={styles.cardName}>{name}</Text>
          <Text style={styles.cardMeta}>
            30-day plan
            {row.expiresAt ? ` · ends ${formatPlanDate(row.expiresAt)}` : ''}
          </Text>
        </View>
        <Tag
          label={paused ? 'PAUSED' : 'ACTIVE'}
          tone={paused ? 'paused' : 'on'}
        />
      </View>
      {total > 0 ? (
        <View style={styles.progress}>
          <View style={styles.progressRow}>
            <Text style={styles.small}>
              {done} of {total} delivered
            </Text>
            <Text style={styles.small}>{Math.max(0, total - done)} left</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${Math.round((done / total) * 100)}%` },
              ]}
            />
          </View>
        </View>
      ) : null}
      {row.deliveries?.length ? (
        <View style={styles.cal}>
          <Text style={styles.calTitle}>Next two weeks</Text>
          <View style={styles.grid}>
            {WEEK.map((w, i) => (
              <Text key={i} style={styles.weekday}>
                {w}
              </Text>
            ))}
            {twoWeeks(row).map(c => (
              <Text
                key={c.key}
                style={[
                  styles.day,
                  c.kind === 'on' && styles.dayOn,
                  c.kind === 'skipped' && styles.daySkipped,
                ]}
              >
                {c.day}
              </Text>
            ))}
          </View>
          <Text style={styles.legend}>
            Green = delivery day. Dashed = skipped.
          </Text>
        </View>
      ) : null}
      {/* DECISION: Skip / Pause / Change slot are not rendered: the backend
          has no customer endpoints for them. TODO(api). */}
      <Pressable
        accessibilityRole="button"
        onPress={onHelp}
        style={styles.help}
      >
        <Text style={styles.helpText}>Help with my plan</Text>
      </Pressable>
    </View>
  );
};

export const PlansScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const products = useProducts();
  const rows = useQuery({
    queryKey: ['plan-rows', isAuthenticated],
    queryFn: planService.getPlanRows,
    enabled: isAuthenticated,
  });
  // Mock mode only: the single mock plan record.
  const mockPlan = usePlan();
  const pull = useRefresh(async () => {
    await Promise.all([rows.refetch(), products.refetch()]);
  });

  const byId = useMemo(
    () => new Map((products.data ?? []).map(p => [p.id, p])),
    [products.data],
  );

  const newPlan = (productId?: string) =>
    mocksEnabled
      ? navigation.navigate(isAuthenticated ? 'PlanPayment' : 'Auth', {})
      : navigation.navigate('NewPlan', { productId });
  const help = () =>
    isAuthenticated
      ? navigation.navigate('Support')
      : navigation.navigate('Auth', { returnTo: 'Support' });

  const now = Date.now();
  const list = (rows.data ?? []).filter(r => r.activatedAt && r.expiresAt);
  const live = list.filter(
    r =>
      (r.status === 'ACTIVE' || r.status === 'PAUSED') &&
      new Date(r.expiresAt as string).getTime() > now,
  );
  const ended = list.filter(r => !live.includes(r));
  const mockActive =
    mocksEnabled && isAuthenticated && mockPlan.data?.status === 'active';

  const nameOf = (r: PlanRow) =>
    (r.productId && byId.get(r.productId)?.name) || '30-day plan';
  const imageOf = (r: PlanRow) =>
    (r.productId && byId.get(r.productId)?.image) || FALLBACK;

  const body = () => {
    if (isAuthenticated && (rows.isLoading || products.isLoading)) {
      return (
        <>
          <Skeleton height={220} borderRadius={13} />
          <Skeleton height={80} borderRadius={13} />
        </>
      );
    }
    if (isAuthenticated && rows.isError) {
      return (
        <ErrorState
          message="We couldn’t load your plans. Check your connection and try again."
          onRetry={rows.refetch}
        />
      );
    }
    const empty = live.length === 0 && ended.length === 0 && !mockActive;
    return (
      <>
        {live.map(r => (
          <ActiveCard
            key={r.id}
            row={r}
            name={nameOf(r)}
            image={imageOf(r)}
            onHelp={help}
          />
        ))}
        {mockActive && mockPlan.data ? (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.flex}>
                <Text style={styles.cardName}>30-day plan</Text>
                <Text style={styles.cardMeta}>
                  Active until {formatPlanDate(mockPlan.data.expiresAt ?? '')}
                </Text>
              </View>
              <Tag label="ACTIVE" tone="on" />
            </View>
          </View>
        ) : null}
        {ended.map(r => (
          <View key={r.id} style={styles.ended}>
            <View style={styles.flex}>
              <Text style={styles.endedName}>Ended · {nameOf(r)}</Text>
              <Text style={styles.endedMeta}>
                30-day plan · ended {formatPlanDate(r.expiresAt as string)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Buy ${nameOf(r)} plan again`}
              onPress={() => newPlan(r.productId)}
              style={styles.again}
            >
              <Text style={styles.link}>Buy again</Text>
            </Pressable>
          </View>
        ))}
        {empty ? (
          <View style={styles.hero}>
            <AspectImage
              source={require('../../../assets/images/lifestyle/week-jars.jpg')}
              ratio={2.1}
              maxHeight={190}
            />
            <View style={styles.heroBody}>
              <Text style={styles.heroKicker}>30-DAY PLAN</Text>
              <Text style={styles.heroTitle}>
                Pay once. Your jar, every morning.
              </Text>
              <Text style={styles.heroCopy}>
                Pick a dish and how often. One prepaid payment covers the whole
                30 days and it ends on its own.
              </Text>
              <Button
                variant="dark"
                label="Build a 30-day plan"
                onPress={() => newPlan()}
              />
            </View>
          </View>
        ) : null}
      </>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Text accessibilityRole="header" style={styles.title}>
          My plans
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => newPlan()}
          style={styles.newLink}
        >
          <Text style={styles.link}>+ New 30-day plan</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...pull} />}
      >
        {body()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: { fontFamily: fontFamily.sansMedium, fontSize: 15, color: colors.ink },
  newLink: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  link: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    color: colors.olive,
  },
  content: { gap: 13, padding: spacing.xl, paddingTop: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 13,
    padding: 14,
    backgroundColor: colors.white,
    gap: 13,
  },
  cardPaused: { opacity: 0.8 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 9,
    backgroundColor: colors.surfaceMuted,
  },
  cardName: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: colors.ink,
  },
  cardMeta: {
    fontFamily: fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },
  tag: {
    ...typography.tag,
    fontSize: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    overflow: 'hidden',
  },
  tagOn: { color: colors.olive, backgroundColor: 'rgba(74,93,46,0.12)' },
  tagPaused: { color: colors.tan, backgroundColor: colors.tagShipsBg },
  progress: { gap: 6 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  small: {
    fontFamily: fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.olive },
  cal: { gap: 8 },
  calTitle: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    color: colors.ink,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  weekday: {
    width: '13%',
    flexGrow: 1,
    textAlign: 'center',
    fontFamily: fontFamily.sansMedium,
    fontSize: 9.5,
    color: colors.textDisabled,
  },
  day: {
    width: '13%',
    flexGrow: 1,
    textAlign: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.tagPlanBg,
    color: 'rgba(27,42,24,0.35)',
    fontFamily: fontFamily.sansMedium,
    fontSize: 9.5,
  },
  dayOn: { backgroundColor: colors.olive, color: colors.onDark },
  daySkipped: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(27,42,24,0.3)',
    color: colors.textMuted,
  },
  legend: {
    fontFamily: fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
  },
  help: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderButton,
  },
  helpText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11.5,
    color: colors.ink,
  },
  ended: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderButton,
    borderRadius: 13,
    padding: 14,
  },
  endedName: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12.5,
    color: colors.ink,
  },
  endedMeta: {
    fontFamily: fontFamily.sans,
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 3,
  },
  again: { minHeight: 44, justifyContent: 'center', paddingLeft: 8 },
  hero: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  heroBody: { padding: 16, gap: 8 },
  heroKicker: {
    ...typography.tag,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: colors.tanDark,
  },
  heroTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 28,
    lineHeight: 31,
    color: colors.ink,
  },
  heroCopy: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 6,
  },
});
