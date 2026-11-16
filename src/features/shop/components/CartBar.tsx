import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../../components/common/Icon';
import { colors, fontFamily, radius } from '../../../theme';
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
      <View style={styles.cta}>
        <Text style={styles.ctaText}>View cart</Text>
        <Icon name="arrowRight" color={colors.ink} size={14} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 14,
    marginBottom: 10,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 10,
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13.5,
    color: colors.onDark,
  },
  sub: { fontFamily: fontFamily.sans, fontSize: 11, color: colors.sage },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.sage,
  },
  ctaText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
});
