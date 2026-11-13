import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useCart } from '../../cart/context/CartContext';
import { useCartSummary } from '../../cart/hooks/useCartSummary';

// Floating "N in cart · total" bar; total comes from the backend summary.
export const CartBar = ({ onPress }: { onPress: () => void }) => {
  const { count } = useCart();
  const { data } = useCartSummary();
  if (count === 0) return null;
  const total = data ? ` · ${formatRupees(data.total)}` : '';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View cart, ${count} items`}
      onPress={onPress}
      style={styles.bar}
    >
      <View>
        <Text style={styles.title}>
          {count} in cart{total}
        </Text>
        <Text style={styles.sub}>
          Delivery and totals confirmed at checkout
        </Text>
      </View>
      <Text style={styles.cta}>View cart →</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 14,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: { ...typography.heading, color: colors.onDark },
  sub: { ...typography.labelSmall, color: colors.sage },
  cta: {
    ...typography.label,
    overflow: 'hidden',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.sage,
    color: colors.ink,
  },
});
