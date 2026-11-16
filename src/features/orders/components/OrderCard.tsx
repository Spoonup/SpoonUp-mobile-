import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { buildTimeline } from '../tracking';
import {
  DELIVERY_LABEL,
  STATUS_LABEL,
  isActive,
  type DeliveryType,
  type Order,
} from '../types';
import type { ImageSourcePropType } from 'react-native';

const TAG: Record<DeliveryType, string> = {
  immediate: 'NOW',
  scheduled: 'SCHEDULED',
  shipped: 'SHIPS',
};

type Props = {
  order: Order;
  image: ImageSourcePropType;
  onPress: () => void;
  onReorder?: () => void;
  onHelp?: () => void;
};

// Mockup 6e card: tag + status, photo + title + meta, progress bar (active)
// or Reorder / Get help (past). Parent/sub-orders stay hidden.
export const OrderCard = ({
  order,
  image,
  onPress,
  onReorder,
  onHelp,
}: Props) => {
  const active = isActive(order);
  const bad = order.status === 'cancelled';
  const statusColor = bad
    ? colors.danger
    : active
    ? colors.olive
    : colors.textMuted;
  const title = order.items
    .map(item => `${item.name} × ${item.quantity}`)
    .join(', ');
  const steps = buildTimeline(order.status);
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Order ${order.number}, ${
          STATUS_LABEL[order.status]
        }`}
        onPress={onPress}
        style={styles.main}
      >
        <View style={styles.head}>
          <Text
            style={[
              styles.tag,
              order.deliveryType === 'immediate' && styles.tagNow,
            ]}
          >
            {TAG[order.deliveryType] ?? DELIVERY_LABEL[order.deliveryType]}
          </Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {STATUS_LABEL[order.status]}
          </Text>
        </View>
        <View style={styles.row}>
          <Image
            source={image}
            style={styles.img}
            accessibilityIgnoresInvertColors
          />
          <View style={styles.flex}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              #{order.number} · {order.placedAt} · {formatRupees(order.total)}
            </Text>
          </View>
        </View>
        {active && !bad ? (
          <View style={styles.progress}>
            <View style={styles.segs}>
              {steps.map(step => (
                <View
                  key={step.status}
                  style={[
                    styles.seg,
                    step.state !== 'upcoming' && styles.segOn,
                  ]}
                />
              ))}
            </View>
            <View style={styles.capRow}>
              <Text style={styles.caption} numberOfLines={1}>
                {order.etaText ?? STATUS_LABEL[order.status]}
              </Text>
              <Text style={styles.cta}>Track</Text>
            </View>
          </View>
        ) : null}
      </Pressable>
      {!active && (onReorder || onHelp) ? (
        <View style={styles.actions}>
          {onReorder ? (
            <Pressable
              accessibilityRole="button"
              onPress={onReorder}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Reorder</Text>
            </Pressable>
          ) : null}
          {onHelp ? (
            <Pressable
              accessibilityRole="button"
              onPress={onHelp}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Get help</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  main: { padding: 14, gap: 8, minHeight: 44 },
  flex: { flex: 1, gap: 2 },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    ...typography.tag,
    fontSize: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 4,
    overflow: 'hidden',
    color: colors.ink,
    backgroundColor: 'rgba(27,42,24,0.08)',
  },
  tagNow: { color: colors.olive, backgroundColor: 'rgba(74,93,46,0.12)' },
  status: { fontFamily: fontFamily.sansSemiBold, fontSize: 11.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  img: {
    width: 44,
    height: 44,
    borderRadius: 9,
    backgroundColor: colors.surfaceMuted,
  },
  title: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  sub: { fontFamily: fontFamily.sans, fontSize: 11.5, color: colors.textMuted },
  progress: { gap: 6, paddingTop: 2 },
  segs: { flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  segOn: { backgroundColor: colors.olive },
  capRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  caption: {
    flex: 1,
    fontFamily: fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
  cta: { fontFamily: fontFamily.sansMedium, fontSize: 11, color: colors.olive },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  btn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(27,42,24,0.18)',
  },
  btnText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11.5,
    color: colors.ink,
  },
});
