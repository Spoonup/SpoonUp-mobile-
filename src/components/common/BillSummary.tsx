import { StyleSheet, Text, View } from 'react-native';
import type { CartSummary } from '../../features/cart/services/cartService';
import { colors, typography } from '../../theme';
import { formatRupees } from '../../utils/money';

// Displays backend-computed figures only; never derives a total.
export const BillSummary = ({ summary }: { summary: CartSummary }) => {
  const { subtotal, deliveryFee, discount, total } = summary;
  const rows: [string, string][] = [
    ['Subtotal', formatRupees(subtotal)],
    ['Delivery', deliveryFee > 0 ? formatRupees(deliveryFee) : 'Free'],
    ...(discount > 0
      ? [['Discount', `−${formatRupees(discount)}`] as [string, string]]
      : []),
    ['To pay', formatRupees(total)],
  ];
  return (
    <View style={styles.bill}>
      {rows.map(([label, value], index) => {
        const last = index === rows.length - 1;
        return (
          <View key={label} style={[styles.row, last && styles.total]}>
            <Text style={last ? styles.totalText : styles.text}>{label}</Text>
            <Text style={last ? styles.totalText : styles.text}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bill: { gap: 7, paddingHorizontal: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  total: { paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  text: { ...typography.bodySmall, color: colors.textSecondary },
  totalText: { ...typography.heading, fontSize: 14.5, color: colors.ink },
});
