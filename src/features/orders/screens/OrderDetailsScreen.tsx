import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useOrder } from '../hooks/useOrders';
import {
  DELIVERY_LABEL,
  PAYMENT_LABEL,
  STATUS_LABEL,
  type Order,
} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const Details = ({ order }: { order: Order }) => (
  <View style={styles.card}>
    <Row label="Order ID" value={order.id} />
    <Row label="Placed" value={order.placedAt} />
    <Row label="Order status" value={STATUS_LABEL[order.status]} />
    <Row label="Payment" value={PAYMENT_LABEL[order.paymentStatus]} />
    <Row label="Delivery" value={DELIVERY_LABEL[order.deliveryType]} />
    <Row label="Address" value={order.address} />
  </View>
);

export const OrderDetailsScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useOrder(route.params.orderId);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <Skeleton height={200} borderRadius={radius.lg} />
          <Skeleton height={100} borderRadius={radius.lg} />
        </View>
      );
    }
    if (error || !order) return <ErrorState onRetry={refetch} />;
    return (
      <>
        <ScrollView contentContainerStyle={styles.content}>
          <Details order={order} />
          <View style={styles.card}>
            <Text style={styles.section}>Items</Text>
            {order.items.map(item => (
              <Row
                key={item.name}
                label={item.name}
                value={`× ${item.quantity}`}
              />
            ))}
            <View style={styles.total}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalText}>{formatRupees(order.total)}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button
            label="Track order"
            onPress={() =>
              navigation.navigate('OrderTracking', { orderId: order.id })
            }
          />
          <Button
            variant="outline"
            label="Get help with this order"
            onPress={() =>
              navigation.navigate('CreateTicket', { orderId: order.id })
            }
          />
        </View>
      </>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Order" onBack={navigation.goBack} />
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  card: {
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  section: { ...typography.heading, color: colors.ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  value: {
    ...typography.label,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalText: { ...typography.heading, color: colors.ink },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
