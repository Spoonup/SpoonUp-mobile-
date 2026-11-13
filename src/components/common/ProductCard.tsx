import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { formatRupees } from '../../utils/money';
import type { Product } from '../../features/shop/data/products';
import { Stepper } from './Stepper';

// Site tags: solid olive for kitchen items, tan for pantry (ships).
const TAG = {
  now: { label: 'NOW · 30–45 MIN', bg: colors.tagNow, fg: colors.surface },
  ships: { label: 'SHIPS · 3–5 DAYS', bg: colors.tan, fg: colors.surface },
} as const;

const NOTE = {
  now: 'Eat-now only',
  ships: 'Ships by courier',
} as const;

type Props = {
  product: Product;
  quantity: number;
  onPress: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onPlan?: () => void;
};

// Single-column site card: 3:2 image, tag overlay, name, description, price,
// note line and a full-width ink "Add to cart" button. No shadow.
export const ProductCard = ({
  product,
  quantity,
  onPress,
  onAdd,
  onRemove,
  onPlan,
}: Props) => {
  const tag = TAG[product.category];
  const note = product.canSubscribe ? 'Plan available' : NOTE[product.category];
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
          <Text
            style={[styles.tag, { color: tag.fg, backgroundColor: tag.bg }]}
          >
            {tag.label}
          </Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>{product.meta}</Text>
          <Text style={styles.price}>{formatRupees(product.price)}</Text>
          <Text style={styles.note}>{note}</Text>
        </View>
      </Pressable>
      <View style={styles.footer}>
        {quantity > 0 ? (
          <Stepper
            variant="outline"
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
            <Text style={styles.addText}>Add to cart</Text>
          </Pressable>
        )}
        {product.canSubscribe && onPlan ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Plan ${product.name}`}
            onPress={onPlan}
            style={styles.plan}
          >
            <Text style={styles.planText}>Plan</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  imageWrap: { aspectRatio: 1.5, backgroundColor: colors.surfaceMuted },
  image: { width: '100%', height: '100%' },
  tag: {
    ...typography.tag,
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  body: { padding: 16, paddingBottom: 12, gap: 4 },
  name: { ...typography.heading, color: colors.ink },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  price: { ...typography.price, color: colors.ink, marginTop: 4 },
  note: { ...typography.labelSmall, color: colors.textSecondary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  add: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xs,
    backgroundColor: colors.ink,
  },
  addText: { ...typography.label, color: colors.onDark },
  plan: {
    minHeight: 44,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderButton,
  },
  planText: { ...typography.label, color: colors.ink },
});
