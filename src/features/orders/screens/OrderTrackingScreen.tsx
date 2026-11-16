import {
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import type { RootStackParamList } from '../../../navigation/types';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { useOrder } from '../hooks/useOrders';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

export const OrderTrackingScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const { orderId } = route.params;
  const {
    data: order,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useOrder(orderId);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <Skeleton height={280} borderRadius={radius.lg} />
        </View>
      );
    }
    if (error || !order) return <ErrorState onRetry={refetch} />;
    return (
      <>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
            />
          }
        >
          <View style={styles.card}>
            <Text style={styles.orderId}>#{order.number}</Text>
            {order.etaText ? (
              <Text accessibilityLiveRegion="polite" style={styles.eta}>
                {order.etaText}
              </Text>
            ) : null}
            <TrackingTimeline status={order.status} />
          </View>
          {order.trackingLink?.startsWith('https://') ? (
            <Button
              variant="outline"
              label="Open courier tracking"
              onPress={() => Linking.openURL(order.trackingLink as string)}
            />
          ) : null}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: footerPad }]}>
          <Button
            variant="outline"
            label="Get help with this order"
            onPress={() => navigation.navigate('CreateTicket', { orderId })}
          />
        </View>
      </>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Track order" onBack={navigation.goBack} />
      {renderBody()}
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
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  orderId: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  eta: { ...typography.body, color: colors.olive },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
