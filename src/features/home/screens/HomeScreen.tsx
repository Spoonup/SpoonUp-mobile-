import { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../cart/context/CartContext';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../../navigation/types';
import { AspectImage } from '../../../components/common/AspectImage';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { Skeleton } from '../../../components/common/Skeleton';
import { formatRupees } from '../../../utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { useUnreadCount } from '../../notifications/hooks/useNotifications';
import { useOrders } from '../../orders/hooks/useOrders';
import { planService } from '../../plan/services/planService';
import { findProduct } from '../../shop/data/products';
import { useProducts } from '../../shop/hooks/useProducts';
import { CategoryTiles, type CategoryTile } from '../components/CategoryTiles';
import { HomeHeader, homeHeaderHeight } from '../components/HomeHeader';
import { ReorderRow } from '../components/ReorderRow';
import {
  deliveryKicker,
  greetingFor,
  initialsOf,
  isReturning,
  livePlan,
  nextDelivery,
  orderAgain,
  subline,
} from '../logic';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const cart = useCart();
  const { isAuthenticated, user } = useAuth();
  const unread = useUnreadCount(isAuthenticated);
  const products = useProducts();
  const orders = useOrders(isAuthenticated);
  const rows = useQuery({
    queryKey: ['plan-rows', isAuthenticated],
    queryFn: planService.getPlanRows,
    enabled: isAuthenticated,
  });
  // Optional "from" price: its failure only hides the price.
  const fromPrice = useQuery({
    queryKey: ['plan-from'],
    queryFn: planService.fromPerJar,
  });

  const shell = (children: React.ReactNode) => (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      {children}
    </View>
  );

  if (isAuthenticated && (orders.isError || rows.isError)) {
    return shell(
      <ErrorState
        onRetry={() => {
          orders.refetch();
          rows.refetch();
        }}
      />,
    );
  }
  if (isAuthenticated && (orders.isLoading || rows.isLoading)) {
    return shell(
      <View style={styles.content}>
        <Skeleton height={44} borderRadius={22} />
        <Skeleton height={36} width="70%" />
        <Skeleton height={120} borderRadius={18} />
        <Skeleton height={160} borderRadius={16} />
      </View>,
    );
  }

  const now = new Date();
  const orderList = orders.data ?? [];
  const rowList = rows.data ?? [];
  const returning = isReturning(isAuthenticated, orderList, rowList);
  const live = livePlan(rowList, now);
  const liveDish = live?.productId ? findProduct(live.productId) : undefined;
  const next = live ? nextDelivery(live, now) : undefined;
  const perJar =
    fromPrice.data != null ? `${formatRupees(fromPrice.data)}` : undefined;

  // DECISION: pantry sold in a separate app/site (no pantry CTA, tile or row).
  const tiles: CategoryTile[] = [
    {
      key: 'now',
      kicker: 'NOW',
      label: 'Eat now',
      sub: '30–45 min',
      image: require('../../../assets/images/lifestyle/eat-now.jpg'),
      onPress: () => navigation.navigate('Shop', { category: 'now' }),
    },
    {
      key: 'plan',
      kicker: '30 DAYS',
      label: '30-day plan',
      sub: perJar ? `Prepaid · from ${perJar}/jar` : 'Prepaid, pay once',
      image: require('../../../assets/images/lifestyle/week-jars.jpg'),
      onPress: () => navigation.navigate('Plans'),
    },
  ];

  const again = orderAgain(orderList, products.data ?? []).map(product => ({
    product,
    quantity: cart.quantityOf(product.id),
    onAdd: () => cart.add(product.id),
  }));

  const kitchen = (products.data ?? []).slice(0, 8).map(product => ({
    product,
    quantity: cart.quantityOf(product.id),
    onAdd: () => cart.add(product.id),
  }));

  return (
    <View style={styles.screen}>
      <HomeHeader
        initials={initialsOf(user?.name)}
        unread={unread}
        onOpenNotifications={() => navigation.navigate('Notifications')}
        onOpenAccount={() => navigation.navigate('Account')}
        scrollY={scrollY}
        topInset={insets.top}
      />
      <Animated.ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: homeHeaderHeight(insets.top) + spacing.sm,
            paddingBottom: spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ top: homeHeaderHeight(insets.top) }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting} numberOfLines={2} ellipsizeMode="tail">
            {greetingFor(user?.name, returning, now.getHours())}
          </Text>
          <Text style={styles.subline}>
            {subline(live, liveDish?.name, now)}
          </Text>
        </View>

        {returning ? (
          next ? (
            <View style={styles.darkCard}>
              {liveDish ? (
                <AspectImage
                  source={liveDish.image}
                  ratio={1}
                  style={styles.thumb}
                />
              ) : null}
              <View style={styles.darkText}>
                <Text style={styles.darkKicker}>
                  {deliveryKicker(next.scheduledDate, now)}
                </Text>
                {liveDish ? (
                  <Text style={styles.darkTitle}>{liveDish.name}</Text>
                ) : null}
                <Text style={styles.darkSub}>
                  Delivery {next.sequenceNo} of{' '}
                  {live?.deliveryCount ?? live?.deliveries?.length} · prepaid
                </Text>
              </View>
              {/* Skip omitted: the backend only exposes delivery skip to admins. */}
            </View>
          ) : null
        ) : (
          <View style={styles.planCard}>
            <AspectImage
              source={require('../../../assets/images/lifestyle/week-jars.jpg')}
              ratio={2.9}
              maxHeight={120}
            />
            <View style={styles.planBody}>
              <Text style={styles.planKicker}>
                {perJar ? `PLAN · FROM ${perJar} A JAR` : 'PLAN · PAY ONCE'}
              </Text>
              <Text style={styles.planTitle}>Start a breakfast plan</Text>
              <Text style={styles.planCopy}>
                Pay once for 30 days of jars at your door. Pick your dish and
                how often.
              </Text>
              <View style={styles.planBtn}>
                <Button
                  variant="dark"
                  label="Build my plan"
                  onPress={() => navigation.navigate('Plans')}
                />
              </View>
            </View>
          </View>
        )}

        <CategoryTiles tiles={tiles} />

        {returning && again.length > 0 ? (
          <ReorderRow
            items={again}
            cartCount={cart.count}
            onOpenCart={() => navigation.navigate('Cart')}
          />
        ) : null}

        {/* Everyone else (guests, first visit) sees the live catalog instead.
          DECISION: the backend has no sales ranking, so this is "From the
          kitchen" (catalog order), not "Best sellers". */}
        {!(returning && again.length > 0) && kitchen.length > 0 ? (
          <ReorderRow
            title="From the kitchen"
            actionLabel="See all"
            items={kitchen}
            cartCount={cart.count}
            onOpenCart={() => navigation.navigate('Cart')}
            onAction={() => navigation.navigate('Shop')}
          />
        ) : null}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.xl, gap: 18 },
  greetingBlock: { gap: 4 },
  greeting: {
    fontFamily: fontFamily.serif,
    fontSize: 32,
    lineHeight: 36,
    color: colors.ink,
  },
  subline: { ...typography.body, fontSize: 14, color: colors.textMuted },
  darkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.ink,
  },
  thumb: { width: 68, borderRadius: 12 },
  darkText: { flex: 1, gap: 3 },
  darkKicker: {
    ...typography.tag,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: colors.sage,
  },
  darkTitle: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 16,
    lineHeight: 21,
    color: colors.onDark,
  },
  darkSub: { ...typography.bodySmall, color: colors.onDarkMuted },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  planBody: { padding: 16, gap: 6 },
  planKicker: {
    ...typography.tag,
    fontSize: 10.5,
    letterSpacing: 1.6,
    color: colors.ink,
  },
  planTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  planCopy: { ...typography.body, color: colors.textMuted },
  planBtn: { alignSelf: 'flex-start', marginTop: 8 },
});
