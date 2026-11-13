import { StyleSheet, Text, View } from 'react-native';
import type { CartSummary } from '../../features/cart/services/cartService';
import { colors, radius, typography } from '../../theme';
import { formatRupees } from '../../utils/money';

// Displays backend-computed figures only; never derives a total.
export const BillSummary = ({ summary }: { summary: CartSummary }) => {
  const { subtotal, tax, deliveryFee, discount, total, finalAtPayment } =
    summary;
  const rows: [string, string][] = [
    ['Items', formatRupees(subtotal)],
    ...(tax ? [['GST', formatRupees(tax)] as [string, string]] : []),
    ['Delivery', deliveryFee > 0 ? formatRupees(deliveryFee) : 'Free'],
    ...(discount > 0
      ? [['Discount', `−${formatRupees(discount)}`] as [string, string]]
      : []),
    [
      finalAtPayment ? 'Total before coupon' : 'Estimated total',
      formatRupees(total),
    ],
  ];
  return (
    <View style={styles.bill}>
      {rows.map(([label, value], index) => {
        const last = index === rows.length - 1;
        return (
          <View key={label} style={[styles.row, last && styles.total]}>
            <Text style={last ? styles.totalLabel : styles.text}>{label}</Text>
            <Text style={last ? styles.totalText : styles.text}>{value}</Text>
          </View>
        );
      })}
      {finalAtPayment ? (
        <Text style={styles.text}>
          Your coupon is applied when you pay. The final amount is shown before
          you confirm.
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bill: {
    gap: 8,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  total: { paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  text: { ...typography.bodySmall, color: colors.textSecondary },
  totalLabel: { ...typography.heading, color: colors.ink },
  totalText: { ...typography.amount, color: colors.ink },
});
