import { useRefresh } from '../../../hooks/useRefresh';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip } from '../../../components/common/Chip';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { Skeleton } from '../../../components/common/Skeleton';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../../navigation/types';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import { useAuth } from '../../auth/context/AuthContext';
import { useCart } from '../../cart/context/CartContext';
import { OrderCard } from '../components/OrderCard';
import { useCatalogMatch } from '../hooks/useCatalogMatch';
import { useOrders } from '../hooks/useOrders';
import { isActive, type Order } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Orders'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Segment = 'all' | 'active' | 'past';

export const OrdersScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const cart = useCart();
  const { imageOf, reorderLines } = useCatalogMatch();
  const [segment, setSegment] = useState<Segment>('all');
  const { data, isLoading, error, refetch } = useOrders(isAuthenticated);
  const pull = useRefresh(refetch);

  const all = data ?? [];
  const active = all.filter(isActive);
  const past = all.filter(order => !isActive(order));
  const groups: { label: string; items: Order[] }[] = [
    ...(segment !== 'past' ? [{ label: 'ACTIVE', items: active }] : []),
    ...(segment !== 'active' ? [{ label: 'PAST', items: past }] : []),
  ].filter(g => g.items.length > 0);

  const reorder = (order: Order) => {
    reorderLines(order).forEach(line => cart.add(line.id, line.quantity));
    navigation.navigate('Cart');
  };

  const renderBody = () => {
    if (!isAuthenticated) {
      return (
        <EmptyState
          title="Sign in to see your orders"
          message="Your order history and tracking live in your account."
          actionLabel="Log in or sign up"
          onAction={() => navigation.navigate('Auth')}
          secondaryLabel="Track an order"
          onSecondary={() => navigation.navigate('GuestTracking')}
        />
      );
    }
    if (isLoading) {
      return (
        <View style={styles.list}>
          <Skeleton height={118} borderRadius={14} />
          <Skeleton height={118} borderRadius={14} />
          <Skeleton height={118} borderRadius={14} />
        </View>
      );
    }
    if (error) {
      return (
        <ErrorState
          message="Active deliveries still arrive. Check your connection and try again."
          onRetry={refetch}
        />
      );
    }
    if (groups.length === 0) {
      return (
        <EmptyState
          title={
            all.length === 0
              ? 'No orders yet'
              : segment === 'active'
              ? 'No active orders'
              : 'No past orders'
          }
          message="Orders you place will show up here."
          actionLabel="Browse the shop"
          onAction={() => navigation.navigate('Shop')}
        />
      );
    }
    return (
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...pull} />}
      >
        {groups.map(group => (
          <View key={group.label} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            {group.items.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                image={imageOf(order.items[0]?.name ?? '')}
                onPress={() =>
                  navigation.navigate('OrderDetails', { orderId: order.id })
                }
                onReorder={
                  reorderLines(order).length > 0
                    ? () => reorder(order)
                    : undefined
                }
                onHelp={() =>
                  navigation.navigate('CreateTicket', { orderId: order.id })
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Text accessibilityRole="header" style={styles.title}>
          My orders
        </Text>
        {isAuthenticated ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Support')}
            style={styles.helpLink}
          >
            <Text style={styles.help}>Help</Text>
          </Pressable>
        ) : null}
      </View>
      {isAuthenticated ? (
        <View style={styles.segments}>
          <Chip
            label="All"
            selected={segment === 'all'}
            onPress={() => setSegment('all')}
          />
          <Chip
            label={`Active · ${active.length}`}
            selected={segment === 'active'}
            onPress={() => setSegment('active')}
          />
          <Chip
            label="Past"
            selected={segment === 'past'}
            onPress={() => setSegment('past')}
          />
        </View>
      ) : null}
      <View style={styles.flex}>{renderBody()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: 30,
    lineHeight: 34,
    color: colors.ink,
  },
  helpLink: { minHeight: 44, justifyContent: 'center', paddingLeft: 12 },
  help: { ...typography.label, color: colors.olive },
  segments: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  list: {
    flexGrow: 1,
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  group: { gap: 10 },
  groupLabel: {
    ...typography.tag,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    paddingTop: 6,
  },
});
