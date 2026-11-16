import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../../components/common/ErrorState';
import { Button } from '../../../components/common/Button';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
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

// Mockup 6d6 (also serves as 6d3 "Payment successful": shown only after the
// backend verified the payment). TODO(api): no ETA text from the backend, so
// the dark card says "Order placed" unless `etaText` exists; no "NOW" note
// with rider text and no cash-on-delivery row.
export const OrderConfirmationScreen = ({ navigation, route }: Props) => {
  const { orderId, paymentReference } = route.params;
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const home = () =>
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <Skeleton height={160} borderRadius={radius.xl} />
        </View>
      );
    }
    if (isError || !order) return <ErrorState onRetry={refetch} />;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>ORDER #{order.number}</Text>
          <Text style={styles.heroTitle}>
            {order.etaText ?? 'Order placed'}
          </Text>
          <Text style={styles.heroSub}>We’ve got it. Track it in Orders.</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.addrWrap}>
              <Text style={styles.kicker}>DELIVER TO</Text>
              <Text style={styles.addr}>{order.address}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Row label="Delivery" value={DELIVERY_LABEL[order.deliveryType]} />
          <Row
            label="Paid online · Razorpay"
            value={formatRupees(order.total)}
          />
          <Row label="Payment reference" value={paymentReference} />
        </View>
        <View style={styles.card}>
          {order.items.map(item => (
            <Row
              key={item.name}
              label={item.name}
              value={`× ${item.quantity}`}
            />
          ))}
        </View>
        <Text style={styles.foot}>
          Something wrong with the order? Raise it from Orders. Any refund comes
          back as SpoonUp credit.
        </Text>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Order confirmed"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={home}
            style={styles.close}
          >
            <Text allowFontScaling={false} style={styles.closeText}>
              ×
            </Text>
          </Pressable>
        }
      />
      {renderBody()}
      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <Button
          variant="dark"
          label="Track order"
          onPress={() => navigation.navigate('OrderTracking', { orderId })}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Shop' } }],
            })
          }
          style={styles.link}
        >
          <Text style={styles.linkText}>Continue shopping</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl, paddingTop: 0 },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 22, lineHeight: 26, color: colors.ink },
  hero: {
    gap: 8,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.ink,
  },
  heroKicker: { ...typography.kicker, fontSize: 11, color: colors.sage },
  heroTitle: { ...typography.headline, color: colors.onDark },
  heroSub: { ...typography.body, color: colors.onDarkMuted },
  card: {
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  kicker: { ...typography.kicker, fontSize: 11, color: colors.textMuted },
  addrWrap: { flex: 1, gap: 4 },
  addr: { ...typography.heading, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.divider },
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
  foot: { ...typography.bodySmall, color: colors.textMuted },
  footer: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  linkText: { ...typography.label, color: colors.olive },
});
