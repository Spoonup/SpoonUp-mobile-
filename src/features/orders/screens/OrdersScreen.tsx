import { useRefresh } from '../../../hooks/useRefresh';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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
import { colors, spacing, typography } from '../../../theme';
import { useAuth } from '../../auth/context/AuthContext';
import { OrderCard } from '../components/OrderCard';
import { useOrders } from '../hooks/useOrders';
import { isActive } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Orders'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Segment = 'active' | 'past';

export const OrdersScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [segment, setSegment] = useState<Segment>('active');
  const { data, isLoading, error, refetch } = useOrders(isAuthenticated);
  const pull = useRefresh(refetch);

  const orders = (data ?? []).filter(
    order => isActive(order) === (segment === 'active'),
  );

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
          <Skeleton height={96} borderRadius={12} />
          <Skeleton height={96} borderRadius={12} />
        </View>
      );
    }
    if (error) return <ErrorState onRetry={refetch} />;
    return (
      <FlatList
        data={orders}
        keyExtractor={order => order.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        {...pull}
        ListEmptyComponent={
          <EmptyState
            title={segment === 'active' ? 'No active orders' : 'No past orders'}
            message="Orders you place will show up here."
            actionLabel="Browse the shop"
            onAction={() => navigation.navigate('Shop')}
          />
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() =>
              navigation.navigate('OrderDetails', { orderId: item.id })
            }
          />
        )}
      />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text accessibilityRole="header" style={styles.title}>
        My orders
      </Text>
      {isAuthenticated ? (
        <View style={styles.segments}>
          <Chip
            label="Active"
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
  title: {
    ...typography.title,
    color: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  list: { flexGrow: 1, gap: spacing.md, paddingHorizontal: spacing.xl },
});
