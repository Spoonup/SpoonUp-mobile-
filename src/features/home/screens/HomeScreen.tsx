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
import { findProduct } from '../../shop/data/products';
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

const NEW_USER_REORDER = ['pudding', 'dragon', 'tikki'];
const RETURNING_REORDER = ['tikki', 'dragon', 'fries'];

export const HomeScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const plan = usePlan();
  const home = useHome();
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
      tag: 'NOW',
      tagColor: colors.olive,
      label: 'Eat now',
      sub: location.eta,
      image: require('../../../assets/images/lifestyle/eat-now.jpg'),
      onPress: () => goShop('now'),
    },
    {
      key: 'plan',
      tag: '30 DAYS',
      tagColor: colors.ink,
      label: '30-day plan',
      sub: 'Prepaid · pay once',
      image: require('../../../assets/images/lifestyle/week-jars.jpg'),
      onPress: () => goShop('plan'),
    },
    {
      key: 'ships',
      tag: 'SHIPS',
      tagColor: colors.tan,
      label: 'Pantry',
      sub: '3–5 days',
      image: require('../../../assets/images/lifestyle/pantry.jpg'),
      onPress: () => goShop('ships'),
    },
  ];

  const reorderIds = isNew ? NEW_USER_REORDER : RETURNING_REORDER;
  const reorderItems = reorderIds.flatMap(id => {
    const product = findProduct(id);
    return product
      ? [{ product, quantity: cart.quantityOf(id), onAdd: () => cart.add(id) }]
      : [];
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <HomeHeader
          area={location.area}
          pincode={location.pincode}
          eta={location.eta}
          initials={initials}
          unread={unreadNotifications}
          onOpenNotifications={() => navigation.navigate('Notifications')}
          onOpenAccount={() => navigation.navigate('Account')}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={styles.hello}>
            {isNew
              ? `Hi ${firstName}, welcome in`
              : `Good morning, ${firstName}`}
          </Text>
          <Text style={styles.sub}>
            {isNew
              ? `Eat-now reaches ${location.area} in ${location.eta}.`
              : 'Good to see you again.'}
          </Text>
        </View>

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

        <CategoryTiles tiles={tiles} />

        <ReorderRow
          title={isNew ? `Popular in ${location.area}` : 'Order again'}
          actionLabel={cart.count > 0 ? `Cart · ${cart.count}` : 'See all'}
          onAction={() =>
            cart.count > 0 ? navigation.navigate('Cart') : goShop('all')
          }
          items={reorderItems}
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
    gap: spacing.lg,
  },
  greeting: { gap: 4 },
  hello: {
    fontFamily: fontFamily.serif,
    fontSize: 30,
    lineHeight: 33,
    color: colors.ink,
  },
  sub: { ...typography.bodySmall, fontSize: 13, color: colors.textSecondary },
  coach: { position: 'absolute', left: 12, right: 12, bottom: 12 },
});
