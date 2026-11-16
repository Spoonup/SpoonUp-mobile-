import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { formatMoney } from '../../../utils/money';
import type { useCreditOffer } from '../hooks/useCredit';

type Offer = ReturnType<typeof useCreditOffer>;

// "Use ₹X SpoonUp credit" row (cart, checkout, plan payment). Amounts are
// the signed-in customer's backend credit; hidden when there is none.
export const CreditToggle = ({ offer }: { offer: Offer }) => {
  if (!offer.show) return null;
  const label = `Use ${formatMoney(offer.max)} SpoonUp credit`;
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.sub}>
          {formatMoney(offer.available)} available · taken off this order
        </Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={offer.on}
        onValueChange={offer.setOn}
        trackColor={{ true: colors.olive, false: colors.borderStrong }}
        thumbColor={colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  text: { flex: 1, gap: 2 },
  title: { ...typography.heading, color: colors.ink },
  sub: { ...typography.bodySmall, color: colors.textSecondary },
});
