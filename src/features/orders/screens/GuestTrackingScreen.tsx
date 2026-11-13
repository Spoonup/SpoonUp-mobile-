import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useRefresh } from '../../../hooks/useRefresh';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { guestOrderService } from '../services/guestOrderService';

type Props = NativeStackScreenProps<RootStackParamList, 'GuestTracking'>;

// Orders placed on this device, read back with their saved access tokens (no
// sign-in). The backend has no reference lookup for guests.
export const GuestTrackingScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['guest-orders'],
    queryFn: guestOrderService.listRecent,
  });
  const pull = useRefresh(refetch);

  const renderBody = () => {
    if (isLoading) return <Skeleton height={200} borderRadius={radius.lg} />;
    if (isError || !data) return <ErrorState onRetry={refetch} />;
    if (data.orders.length === 0) {
      return (
        <EmptyState
          title="No orders on this device"
          message="Orders you place are saved here automatically, so you can track them without signing in. If you ordered on another phone, sign in to see your orders."
          actionLabel="Log in"
          onAction={() => navigation.navigate('Auth')}
        />
      );
    }
    return (
      <>
        {data.orders.map(order => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.ref}>{order.number}</Text>
            <Text style={styles.meta}>Placed {order.placedAt}</Text>
            {order.etaText ? (
              <Text accessibilityLiveRegion="polite" style={styles.eta}>
                {order.etaText}
              </Text>
            ) : null}
            <TrackingTimeline status={order.status} />
          </View>
        ))}
        {data.unavailable > 0 ? (
          <Text style={styles.meta}>
            {data.unavailable} saved{' '}
            {data.unavailable === 1 ? 'order' : 'orders'} couldn’t be loaded.
            The saved link may have expired.
          </Text>
        ) : null}
      </>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Track an order" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        refreshControl={<RefreshControl {...pull} />}
      >
        {renderBody()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  ref: { ...typography.heading, color: colors.ink },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  eta: { ...typography.body, color: colors.olive },
});
