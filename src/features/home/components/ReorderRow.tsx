import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from '../../../components/common/Icon';
import { colors, fontFamily, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import type { Product } from '../../shop/data/products';

const Separator = () => <View style={styles.separator} />;

type Item = { product: Product; quantity: number; onAdd: () => void };

type Props = {
  items: Item[];
  cartCount: number;
  onOpenCart: () => void;
  title?: string;
  // Header link: defaults to "Cart · N"; pass to override (e.g. "See all").
  actionLabel?: string;
  onAction?: () => void;
};

// Approved app design (6b "Order again"): horizontal product cards, + / check
// qty badge on the photo, "Cart · N" link.
export const ReorderRow = ({
  items,
  cartCount,
  onOpenCart,
  title = 'Order again',
  actionLabel,
  onAction,
}: Props) => (
  <View style={styles.wrap}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAction ?? onOpenCart}
        hitSlop={8}
        style={styles.actionHit}
      >
        <Text style={styles.action}>
          {actionLabel ?? (cartCount > 0 ? `Cart · ${cartCount}` : 'Cart')}
        </Text>
      </Pressable>
    </View>
    <FlatList
      horizontal
      data={items}
      keyExtractor={item => item.product.id}
      showsHorizontalScrollIndicator={false}
      style={styles.bleed}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={Separator}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.imageWrap}>
            <Image
              source={item.product.image}
              style={styles.image}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.product.name}`}
              onPress={item.onAdd}
              hitSlop={6}
              style={[styles.addBtn, item.quantity > 0 && styles.addBtnOn]}
            >
              {item.quantity > 0 ? (
                <View style={styles.qtyRow}>
                  <Icon
                    name="check"
                    color={colors.onDark}
                    size={14}
                    strokeWidth={2.2}
                  />
                  <Text style={styles.addTextOn}>{item.quantity}</Text>
                </View>
              ) : (
                <Icon name="plus" color={colors.ink} size={18} />
              )}
            </Pressable>
          </View>
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={2}>
              {item.product.name}
            </Text>
            <Text style={styles.price}>{formatRupees(item.product.price)}</Text>
          </View>
        </View>
      )}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  action: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: colors.olive,
  },
  // Lets the row scroll edge to edge past the screen padding.
  bleed: { marginHorizontal: -20 },
  list: { paddingHorizontal: 20 },
  separator: { width: 12 },
  card: {
    width: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  imageWrap: { aspectRatio: 1.42, backgroundColor: colors.surfaceMuted },
  image: { width: '100%', height: '100%' },
  addBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    minWidth: 44,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnOn: { backgroundColor: colors.olive },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionHit: { minHeight: 44, justifyContent: 'center' },
  addTextOn: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: colors.onDark,
  },
  meta: { padding: 12, gap: 2 },
  // Always reserve two lines so every card in the row is the same height.
  name: {
    ...typography.heading,
    fontSize: 14,
    lineHeight: 19,
    minHeight: 38,
    color: colors.ink,
  },
  price: { ...typography.heading, fontSize: 14, color: colors.ink },
});
