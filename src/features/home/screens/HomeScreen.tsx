import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useProducts } from '../../shop/hooks/useProducts';
import { Button } from '../../../components/common/Button';
import { PlanCard } from '../components/PlanCard';
import { usePlan } from '../../plan/hooks/usePlan';
import { CategoryTiles, type CategoryTile } from '../components/CategoryTiles';
import { CoachMark } from '../components/CoachMark';
import { useAuth } from '../../auth/context/AuthContext';
import { useUnreadCount } from '../../notifications/hooks/useNotifications';
import { HomeHeader } from '../components/HomeHeader';
import { ReorderRow } from '../components/ReorderRow';
import { useHome } from '../hooks/useHome';
import { Skeleton } from '../../../components/common/Skeleton';
import { ErrorState } from '../../../components/common/ErrorState';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BESTSELLERS = 3;

export const HomeScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const plan = usePlan();
  const home = useHome();
  const products = useProducts();
  const [coachDismissed, setCoachDismissed] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const unreadNotifications = useUnreadCount(isAuthenticated);

  if (!home.data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
        {home.isError ? (
          <ErrorState onRetry={() => home.refetch()} />
        ) : (
          <View style={styles.header}>
            <Skeleton height={44} borderRadius={12} />
            <View style={styles.skeletonGap} />
            <Skeleton height={28} width="60%" />
            <View style={styles.skeletonGap} />
            <Skeleton height={120} borderRadius={16} />
            <View style={styles.skeletonGap} />
            <Skeleton height={160} borderRadius={16} />
          </View>
        )}
      </View>
    );
  }

  const { isNewUser: isNew, location } = home.data;
  // Guests have no name; signed-in users show their own (home mock only supplies location).
  const firstName = user?.name.trim().split(' ')[0] || 'there';
  const initials = user?.name.trim().charAt(0).toUpperCase() || 'G';
  const showCoach = isNew && !coachDismissed;

  const goShop = (category?: 'all' | 'now' | 'plan' | 'ships') =>
    navigation.navigate('Shop', { category });

  const tiles: CategoryTile[] = [
    {
      key: 'now',
      tag: 'NOW · 30–45 MIN',
      tagColor: colors.olive,
      tagBg: colors.tagNowBg,
      label: 'Eat now',
      sub: 'Made fresh in our kitchen and at your door in under 45 minutes.',
      image: require('../../../assets/images/lifestyle/eat-now.jpg'),
      onPress: () => goShop('now'),
    },
    {
      key: 'plan',
      tag: 'PLAN · PAY ONCE',
      tagColor: colors.ink,
      tagBg: colors.tagPlanBg,
      label: '30-day plan',
      sub: 'Pay once for the whole plan and we deliver on your schedule.',
      image: require('../../../assets/images/lifestyle/week-jars.jpg'),
      onPress: () => navigation.navigate('Plans'),
    },
    {
      key: 'ships',
      tag: 'SHIPS · 3–5 DAYS',
      tagColor: colors.tan,
      tagBg: colors.tagShipsBg,
      label: 'Pantry',
      sub: 'Kashmiri dry fruits, muesli and modak, sourced per order.',
      image: require('../../../assets/images/lifestyle/pantry.jpg'),
      onPress: () => goShop('ships'),
    },
  ];

  // Bestseller rows come from the catalog service; no hardcoded ids.
  const rowItems = (category: 'now' | 'ships') =>
    (products.data ?? [])
      .filter(product => product.category === category)
      .slice(0, BESTSELLERS)
      .map(product => ({
        product,
        quantity: cart.quantityOf(product.id),
        onAdd: () => cart.add(product.id),
      }));
  const kitchenItems = rowItems('now');
  const pantryItems = rowItems('ships');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <HomeHeader
          location={location}
          initials={initials}
          unread={unreadNotifications}
          cartCount={cart.count}
          onOpenCart={() => navigation.navigate('Cart')}
          onOpenNotifications={() => navigation.navigate('Notifications')}
          onOpenAccount={() => navigation.navigate('Account')}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>GOOD FOOD, HIGHER DAYS</Text>
          {isAuthenticated ? (
            <Text style={styles.hello}>Good to see you, {firstName}.</Text>
          ) : null}
          <Text style={styles.h1}>
            Food that tastes like a <Text style={styles.h1Italic}>craving</Text>
            , works like a plan.
          </Text>
          <Text style={styles.lead}>
            Made fresh in our kitchen every morning. Real ingredients, nothing
            refined, at your door in 30 min.
          </Text>
          <Button label="Order in 30 min" onPress={() => goShop('now')} />
          <View style={styles.pair}>
            <View style={styles.flex}>
              <Button
                variant="outline"
                label="Build your plan"
                onPress={() => navigation.navigate('Plans')}
              />
            </View>
            <View style={styles.flex}>
              <Button
                variant="outline"
                label="Shop dry fruits"
                onPress={() => goShop('ships')}
              />
            </View>
          </View>
          <View style={styles.pair}>
            <View style={styles.flex}>
              <Text style={styles.stat}>0G REFINED SUGAR</Text>
              <Text style={styles.statSub}>
                Sweetened with fruit and dates only.
              </Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.stat}>UP TO 21G PROTEIN</Text>
              <Text style={styles.statSub}>Printed on every dish we make.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Three ways to eat with us</Text>
          <CategoryTiles tiles={tiles} />
        </View>

        <ReorderRow
          title="Bestsellers from the kitchen"
          actionLabel="See all kitchen items"
          onAction={() => goShop('now')}
          items={kitchenItems}
        />

        {plan.data ? (
          <PlanCard
            plan={
              isAuthenticated
                ? plan.data
                : { ...plan.data, status: 'none', daysLeft: 0 }
            }
            onPress={() => navigation.navigate('Plans')}
          />
        ) : null}

        <ReorderRow
          title="Bestsellers from the pantry"
          actionLabel="See all pantry"
          onAction={() => goShop('ships')}
          items={pantryItems}
        />
      </ScrollView>

      {showCoach ? (
        <View style={styles.coach}>
          <CoachMark onDismiss={() => setCoachDismissed(true)} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.xl },
  skeletonGap: { height: spacing.lg },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: 40,
  },
  flex: { flex: 1 },
  hero: { gap: spacing.md },
  kicker: { ...typography.kicker, color: colors.tanDark },
  hello: { ...typography.titleCard, color: colors.ink },
  h1: { ...typography.display, color: colors.ink },
  h1Italic: { fontFamily: fontFamily.serifItalic },
  lead: { ...typography.bodyLarge, color: colors.ink },
  pair: { flexDirection: 'row', gap: spacing.md },
  stat: {
    ...typography.kicker,
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.ink,
  },
  statSub: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  section: { gap: spacing.lg },
  h2: { ...typography.headline, color: colors.ink },
  coach: { position: 'absolute', left: 12, right: 12, bottom: 12 },
});
