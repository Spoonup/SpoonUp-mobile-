import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { Icon } from '../../../components/common/Icon';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { useProducts } from '../../shop/hooks/useProducts';
import { frequencyLabel } from '../logic';
import { planService } from '../services/planService';

type Props = NativeStackScreenProps<RootStackParamList, 'NewPlan'>;

// Mockup 6f2: pick a jar, pick how often, see the plan, pay once. The backend
// prices every plan (cart quote); the app only displays quotes.
// DECISION: slot, start-date and "you save" rows are omitted: the backend has
// no slot/start options for customers (start defaults to the next day) and no
// MRP to compare. TODO(api) if those become available.
export const NewPlanScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const { isAuthenticated } = useAuth();
  const products = useProducts();
  const options = useQuery({
    queryKey: ['plan-options'],
    queryFn: planService.getOptions,
  });
  const [chosenProduct, setProduct] = useState<string | undefined>(
    route.params?.productId,
  );
  const [chosenFrequency, setFrequency] = useState<string>();

  const choices = (products.data ?? []).filter(p => p.canSubscribe);
  const frequencies = options.data?.frequencies ?? [];
  const productId =
    choices.find(p => p.id === chosenProduct)?.id ?? choices[0]?.id;
  const dish = choices.find(p => p.id === productId);
  const frequency = chosenFrequency ?? frequencies[1] ?? frequencies[0];

  // One backend quote per frequency: gives each tile its delivery count.
  const quotes = useQueries({
    queries: frequencies.map(f => ({
      queryKey: ['plan-quote', productId, f],
      queryFn: () => planService.quote(productId as string, f),
      enabled: !!productId,
    })),
  });
  const quote = quotes[frequencies.indexOf(frequency as string)]?.data;

  const proceed = () =>
    isAuthenticated
      ? navigation.navigate('PlanPayment', {
          productId: productId as string,
          frequency: frequency as string,
        })
      : navigation.navigate('Auth', { returnTo: 'PlanPayment' });

  const body = () => {
    if (products.isError || options.isError) {
      return (
        <ErrorState
          message="We couldn’t load plans. Check your connection and try again."
          onRetry={() => {
            products.refetch();
            options.refetch();
          }}
        />
      );
    }
    if (products.isLoading || options.isLoading) {
      return (
        <View style={styles.content}>
          <Skeleton height={130} borderRadius={13} />
          <Skeleton height={70} borderRadius={10} />
          <Skeleton height={140} borderRadius={16} />
        </View>
      );
    }
    if (choices.length === 0 || frequencies.length === 0) {
      return (
        <Text style={[styles.note, styles.content]}>
          Nothing is set up for a plan right now. Check back soon.
        </Text>
      );
    }
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>1 · PICK YOUR JAR</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.jars}
        >
          {choices.map(p => {
            const on = p.id === productId;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={p.name}
                accessibilityState={{ selected: on }}
                onPress={() => setProduct(p.id)}
                style={[styles.jar, on && styles.jarOn]}
              >
                <View style={styles.jarImg}>
                  <Image
                    source={p.image}
                    style={styles.fill}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                  {on ? (
                    <View style={styles.tick}>
                      <Icon
                        name="check"
                        color={colors.onDark}
                        size={12}
                        strokeWidth={2.4}
                      />
                    </View>
                  ) : null}
                </View>
                <Text style={styles.jarName} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={styles.jarPrice}>{formatRupees(p.price)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.kicker}>
          2 · HOW OFTEN, FOR {options.data?.validityDays ?? 30} DAYS
        </Text>
        <View style={styles.grid}>
          {frequencies.map((f, i) => {
            // 4 options fit 2x2 better than 3 + 1.
            const wide = frequencies.length % 3 === 1;
            const on = f === frequency;
            const n = quotes[i]?.data?.deliveryCount;
            return (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setFrequency(f)}
                style={[styles.opt, wide && styles.optWide, on && styles.optOn]}
              >
                <Text style={[styles.optLabel, on && styles.onDark]}>
                  {frequencyLabel(f)}
                </Text>
                {n ? (
                  <Text style={[styles.optSub, on && styles.onDark]}>
                    {n} deliveries
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.planCard}>
          <Text style={styles.planKicker}>YOUR PLAN</Text>
          <Text style={styles.planName}>{dish?.name}</Text>
          {quote ? (
            <>
              <Text style={styles.planDesc}>
                {frequencyLabel(frequency as string)} · {quote.deliveryCount}{' '}
                deliveries over {quote.validityDays} days
              </Text>
              <View style={styles.planTotal}>
                <Text style={styles.planPer}>
                  {quote.deliveryCount} × about{' '}
                  {formatRupees(quote.total / quote.deliveryCount)}
                </Text>
                <Text style={styles.planAmount}>
                  {formatRupees(quote.total)}
                </Text>
              </View>
              <Text style={styles.planNote}>
                Includes GST. Starts only after we verify your payment.
              </Text>
            </>
          ) : quotes.some(q => q.isError) ? (
            <Text style={styles.planDesc}>We couldn’t price this plan.</Text>
          ) : (
            <Skeleton height={60} />
          )}
        </View>
        <Text style={styles.note}>
          Pay once, online. Nothing renews or is charged again after the plan
          ends.
        </Text>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="30-day plan" onBack={navigation.goBack} />
      <Text style={styles.sub}>Prepaid once · never renews</Text>
      <View style={styles.flex}>{body()}</View>
      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <Button
          variant="dark"
          label={quote ? `Continue · ${formatRupees(quote.total)}` : 'Continue'}
          disabled={!quote}
          onPress={proceed}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  fill: { width: '100%', height: '100%' },
  sub: {
    ...typography.labelSmall,
    color: colors.textMuted,
    paddingHorizontal: spacing.xl,
    marginTop: -6,
  },
  content: { gap: 12, padding: spacing.xl },
  kicker: {
    ...typography.tag,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  bleed: { marginHorizontal: -spacing.xl },
  jars: { gap: 9, paddingHorizontal: spacing.xl, paddingVertical: 4 },
  jar: {
    width: 124,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jarOn: { borderWidth: 2, borderColor: colors.olive },
  jarImg: { height: 86, backgroundColor: colors.surfaceMuted },
  tick: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jarName: {
    ...typography.labelSmall,
    color: colors.ink,
    paddingHorizontal: 9,
    paddingTop: 8,
  },
  jarPrice: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 11,
    color: colors.olive,
    paddingHorizontal: 9,
    paddingBottom: 9,
    paddingTop: 2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  opt: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  optWide: { flexBasis: '47%' },
  optOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  optLabel: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 12,
    color: colors.ink,
    textAlign: 'center',
  },
  optSub: {
    fontFamily: fontFamily.sans,
    fontSize: 10,
    color: colors.textMuted,
  },
  onDark: { color: colors.onDark },
  planCard: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  planKicker: {
    ...typography.tag,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.sage,
  },
  planName: {
    fontFamily: fontFamily.serif,
    fontSize: 22,
    lineHeight: 26,
    color: colors.onDark,
  },
  planDesc: { ...typography.bodySmall, color: colors.onDarkMuted },
  planTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252,251,247,0.15)',
  },
  planPer: { ...typography.bodySmall, color: colors.onDarkMuted },
  planAmount: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 18,
    color: colors.onDark,
  },
  planNote: { ...typography.labelSmall, color: colors.sage },
  note: { ...typography.labelSmall, color: colors.textMuted, lineHeight: 16 },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
