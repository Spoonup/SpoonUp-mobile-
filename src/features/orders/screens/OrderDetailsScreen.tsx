import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { Icon } from '../../../components/common/Icon';
import { Skeleton } from '../../../components/common/Skeleton';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useCart } from '../../cart/context/CartContext';
import { TrackingTimeline } from '../components/TrackingTimeline';
import { useCatalogMatch } from '../hooks/useCatalogMatch';
import { useOrder } from '../hooks/useOrders';
import {
  DELIVERY_LABEL,
  PAYMENT_LABEL,
  STATUS_LABEL,
  isActive,
} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

// Mockup 6e2: header (#number, placed, tag), status hero, STATUS timeline,
// ITEMS + bill, DELIVER TO, Get help.
// DECISION: map/rider card, Invoice, rating and Cancel order are not rendered:
// the backend has no rider, invoice, rating or customer-cancel endpoints.
export const OrderDetailsScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const cart = useCart();
  const { imageOf, reorderLines } = useCatalogMatch();
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
          <Skeleton height={110} borderRadius={16} />
          <Skeleton height={200} borderRadius={14} />
        </View>
      );
    }
    if (error || !order) return <ErrorState onRetry={refetch} />;
    const active = isActive(order);
    const lines = reorderLines(order);
    return (
      <>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.hero, active ? styles.heroDark : styles.heroLight]}
          >
            <Text style={[styles.heroKicker, active && styles.sage]}>
              {STATUS_LABEL[order.status].toUpperCase()}
            </Text>
            <Text style={[styles.heroHead, active && styles.onDark]}>
              {order.etaText ?? DELIVERY_LABEL[order.deliveryType]}
            </Text>
            <Text style={[styles.heroSub, active && styles.sage]}>
              {PAYMENT_LABEL[order.paymentStatus]}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={[styles.kicker, styles.kickerPad]}>STATUS</Text>
            <TrackingTimeline status={order.status} />
          </View>

          <View style={styles.card}>
            <Text style={[styles.kicker, styles.kickerPad]}>ITEMS</Text>
            {order.items.map(item => (
              <View key={item.name} style={styles.item}>
                <Image
                  source={imageOf(item.name)}
                  style={styles.itemImg}
                  accessibilityIgnoresInvertColors
                />
                <Text style={styles.itemName}>
                  {item.name} × {item.quantity}
                </Text>
              </View>
            ))}
            <View style={styles.bill}>
              <View style={styles.billRow}>
                <Text style={styles.billKey}>
                  {PAYMENT_LABEL[order.paymentStatus]}
                </Text>
                <Text style={styles.billTotal}>
                  {formatRupees(order.total)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.deliver}>
            <Text style={styles.kicker}>DELIVER TO</Text>
            <Text style={styles.address}>{order.address}</Text>
          </View>

          <Button
            variant="outline"
            label="Get help"
            onPress={() =>
              navigation.navigate('CreateTicket', { orderId: order.id })
            }
          />
        </ScrollView>
        {!active && lines.length > 0 ? (
          <View style={[styles.footer, { paddingBottom: footerPad }]}>
            <Button
              variant="dark"
              label="Reorder these items"
              onPress={() => {
                lines.forEach(l => cart.add(l.id, l.quantity));
                navigation.navigate('Cart');
              }}
            />
          </View>
        ) : null}
      </>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={navigation.goBack}
          style={styles.back}
        >
          <Icon name="back" color={colors.ink} size={20} />
        </Pressable>
        <View style={styles.flex}>
          <Text
            accessibilityRole="header"
            style={styles.number}
            numberOfLines={1}
          >
            {order ? `#${order.number}` : 'Order'}
          </Text>
          {order ? <Text style={styles.placed}>{order.placedAt}</Text> : null}
        </View>
        {order ? (
          <Text style={styles.tag}>
            {STATUS_LABEL[order.status].toUpperCase()}
          </Text>
        ) : null}
      </View>
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  placed: {
    fontFamily: fontFamily.sans,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  tag: {
    ...typography.tag,
    fontSize: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
    color: colors.olive,
    backgroundColor: 'rgba(74,93,46,0.12)',
  },
  content: { gap: 12, padding: 20, paddingBottom: 24 },
  hero: { borderRadius: 16, padding: 16, gap: 6 },
  heroDark: { backgroundColor: colors.ink },
  heroLight: { backgroundColor: colors.surfaceMuted },
  heroKicker: {
    ...typography.tag,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  heroHead: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  heroSub: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  onDark: { color: colors.onDark },
  sage: { color: colors.sage },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 14,
    paddingBottom: 4,
  },
  kicker: {
    ...typography.tag,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  kickerPad: { marginBottom: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingBottom: 10,
  },
  itemImg: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: colors.surfaceMuted,
  },
  itemName: {
    flex: 1,
    fontFamily: fontFamily.sansMedium,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.ink,
  },
  bill: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingVertical: 12,
  },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  billKey: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  billTotal: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  deliver: {
    gap: 3,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  address: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
