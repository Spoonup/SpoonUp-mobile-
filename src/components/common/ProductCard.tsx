import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, typography } from '../../theme';
import { formatRupees } from '../../utils/money';
import type { Product } from '../../features/shop/data/products';
import { AspectImage } from './AspectImage';
import { Icon } from './Icon';
import { Stepper } from './Stepper';

type Props = {
  product: Product;
  quantity: number;
  onPress: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onPlan?: () => void;
};

// Mockup 6c: 2-column card. Image fills the card width (AspectImage), NOW tag,
// name, backend kind/unit line, price + Add (or stepper), optional "Plan it".
// DECISION: pantry sold in a separate app/site, so every card is a kitchen item.
export const ProductCard = ({
  product,
  quantity,
  onPress,
  onAdd,
  onRemove,
  onPlan,
}: Props) => {
  // Real backend fields only: kind label + sold-per unit; mock data uses meta.
  const sub =
    [product.categoryLabel, product.unit && `per ${product.unit}`]
      .filter(Boolean)
      .join(' · ') || product.meta;
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatRupees(product.price)}`}
        onPress={onPress}
        style={styles.top}
      >
        <AspectImage source={product.image} ratio={1.4} maxHeight={150}>
          <Text style={styles.tag}>NOW</Text>
        </AspectImage>
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          {sub ? (
            <Text style={styles.meta} numberOfLines={1}>
              {sub}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.footer}>
        <View style={styles.buyRow}>
          <Text style={styles.price}>{formatRupees(product.price)}</Text>
          {quantity > 0 ? (
            <Stepper
              compact
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
              <Icon
                name="plus"
                color={colors.onDark}
                size={14}
                strokeWidth={2.2}
              />
              <Text style={styles.addText}>Add</Text>
            </Pressable>
          )}
        </View>
        {onPlan && !product.canSubscribe ? (
          // Keeps price rows aligned across a row of cards.
          <View style={styles.planSlot} />
        ) : null}
        {product.canSubscribe && onPlan ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Plan ${product.name}`}
            onPress={onPlan}
            hitSlop={{ top: 4, bottom: 4 }}
            style={styles.plan}
          >
            <Text style={styles.planText}>Plan it</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  top: { flex: 1 },
  tag: {
    ...typography.tag,
    position: 'absolute',
    top: 8,
    left: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    color: colors.tagNow,
  },
  body: { paddingHorizontal: 11, paddingTop: 10, gap: 3 },
  name: { ...typography.label, lineHeight: 16, color: colors.ink },
  meta: { ...typography.labelSmall, fontSize: 10.5, color: colors.textMuted },
  footer: { paddingHorizontal: 11, paddingTop: 6, paddingBottom: 11, gap: 6 },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    gap: 6,
  },
  price: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  add: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  addText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 12,
    color: colors.onDark,
  },
  planSlot: { height: 40 },
  plan: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  planText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 11.5,
    color: colors.ink,
  },
});
