import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { formatRupees } from '../../utils/money';
import type { Product } from '../../features/shop/data/products';
import { Stepper } from './Stepper';

const TAG = {
  now: { label: 'NOW', color: colors.tagNow },
  ships: { label: 'SHIPS', color: colors.tagShips },
} as const;

type Props = {
  product: Product;
  quantity: number;
  onPress: () => void;
  onAdd: () => void;
  onRemove: () => void;
};

export const ProductCard = ({
  product,
  quantity,
  onPress,
  onAdd,
  onRemove,
}: Props) => {
  const tag = TAG[product.category];
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatRupees(product.price)}`}
        onPress={onPress}
      >
        <View style={styles.imageWrap}>
          <Image
            source={product.image}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <Text style={[styles.tag, { color: tag.color }]}>{tag.label}</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>{product.meta}</Text>
        </View>
      </Pressable>
      <View style={styles.footer}>
        <Text style={styles.price}>{formatRupees(product.price)}</Text>
        {quantity > 0 ? (
          <Stepper
            quantity={quantity}
            itemName={product.name}
            onIncrement={onAdd}
            onDecrement={onRemove}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name}`}
            onPress={onAdd}
            style={styles.add}
          >
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  imageWrap: { height: 118, backgroundColor: colors.surfaceMuted },
  image: { width: '100%', height: '100%' },
  tag: {
    ...typography.tag,
    position: 'absolute',
    top: 8,
    left: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  body: { paddingHorizontal: 11, paddingTop: 10, gap: 3 },
  name: { ...typography.label, color: colors.ink, lineHeight: 16 },
  meta: { ...typography.labelSmall, color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    paddingBottom: 6,
    paddingTop: 2,
    marginTop: 'auto',
  },
  price: { ...typography.heading, color: colors.ink },
  add: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  addText: { ...typography.label, color: colors.onDark },
});
