import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { Skeleton } from '../../../components/common/Skeleton';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useOrder } from '../../orders/hooks/useOrders';
import { DELIVERY_LABEL } from '../../orders/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderConfirmation'>;

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export const OrderConfirmationScreen = ({ navigation, route }: Props) => {
  const { orderId, paymentReference } = route.params;
  const insets = useSafeAreaInsets();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <Skeleton height={220} borderRadius={radius.lg} />
        </View>
      );
    }
    if (isError || !order) return <ErrorState onRetry={refetch} />;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Order confirmed
        </Text>
        <Text style={styles.sub}>
          Payment received. We’re getting your order ready.
        </Text>
        <View style={styles.card}>
          <Row label="Order ID" value={order.id} />
          <Row label="Payment reference" value={paymentReference} />
          <Row label="Delivery" value={DELIVERY_LABEL[order.deliveryType]} />
          <Row label="Address" value={order.address} />
        </View>
        <View style={styles.card}>
          {order.items.map(item => (
            <Row
              key={item.name}
              label={item.name}
              value={`× ${item.quantity}`}
            />
          ))}
          <View style={styles.total}>
            <Text style={styles.totalText}>Total paid</Text>
            <Text style={styles.totalText}>{formatRupees(order.total)}</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {renderBody()}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label="View order"
          onPress={() => navigation.navigate('OrderDetails', { orderId })}
        />
        <Button
          variant="outline"
          label="Back to home"
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  title: { ...typography.title, color: colors.ink },
  sub: { ...typography.body, color: colors.textSecondary },
  card: {
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
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
