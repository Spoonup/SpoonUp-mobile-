import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { STATUS_LABEL, isActive, type Order } from '../types';

export const OrderCard = ({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) => {
  const active = isActive(order);
  const accent = active ? colors.olive : colors.ink;
  const summary = order.items
    .map(item => `${item.name} × ${item.quantity}`)
    .join(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.number}, ${
        STATUS_LABEL[order.status]
      }`}
      onPress={onPress}
      style={[styles.card, { borderLeftColor: accent }]}
    >
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text style={styles.id}>Order {order.number}</Text>
          <Text style={styles.sub}>
            {order.placedAt} · {formatRupees(order.total)}
          </Text>
        </View>
        <Text
          style={[
            styles.status,
            {
              color: accent,
              backgroundColor: active ? colors.tagNowBg : colors.tagPlanBg,
            },
          ]}
        >
          {STATUS_LABEL[order.status].toUpperCase()}
        </Text>
      </View>
      <Text style={styles.items} numberOfLines={2}>
        {summary}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 44,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  id: { ...typography.titleCard, color: colors.ink },
  sub: { ...typography.labelSmall, color: colors.textSecondary, marginTop: 2 },
  status: {
    ...typography.tag,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  items: { ...typography.bodySmall, color: colors.ink },
});
