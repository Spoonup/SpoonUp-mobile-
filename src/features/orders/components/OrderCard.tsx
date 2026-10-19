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
      accessibilityLabel={`Order ${order.id}, ${STATUS_LABEL[order.status]}`}
      onPress={onPress}
      style={[styles.card, { borderLeftColor: accent }]}
    >
      <View style={styles.head}>
        <View style={styles.flex}>
          <Text style={styles.id}>Order {order.id}</Text>
          <Text style={styles.sub}>
            {order.placedAt} · {formatRupees(order.total)}
          </Text>
        </View>
        <Text style={[styles.status, { color: accent }]}>
          {STATUS_LABEL[order.status]}
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
    padding: 13,
    gap: 7,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderLeftWidth: 3,
    borderRadius: radius.lg - 2,
    backgroundColor: colors.white,
  },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  id: { ...typography.label, color: colors.ink },
  sub: { ...typography.labelSmall, color: colors.textMuted, marginTop: 2 },
  status: { ...typography.labelSmall },
  items: { ...typography.bodySmall, color: colors.ink },
});
