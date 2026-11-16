import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { Icon } from './Icon';

type Props = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  itemName: string;
  // Screen reader text for the count; defaults to the cart wording.
  quantityLabel?: string;
  // 'solid' = olive pill (shop card), 'outline' = bordered (cart row).
  variant?: 'solid' | 'outline';
  // Narrower buttons for 2-column product cards (still 44pt tall).
  compact?: boolean;
  // Sold-per unit shown after the count, e.g. "1 jar" (product details).
  unit?: string;
};

export const Stepper = ({
  quantity,
  onIncrement,
  onDecrement,
  itemName,
  quantityLabel,
  variant = 'solid',
  compact = false,
  unit,
}: Props) => {
  const solid = variant === 'solid';
  const glyph = solid ? colors.onDark : colors.ink;
  const textStyle = [styles.text, solid && styles.textSolid];
  return (
    <View style={[styles.wrap, solid ? styles.solid : styles.outline]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove one ${itemName}`}
        onPress={onDecrement}
        style={[styles.btn, compact && styles.btnCompact]}
      >
        <Icon name="minus" color={glyph} size={16} />
      </Pressable>
      <Text
        accessibilityLabel={quantityLabel ?? `${quantity} in cart`}
        style={[textStyle, styles.qty]}
      >
        {quantity}
        {unit ? <Text style={styles.unit}>{` ${unit}`}</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add one ${itemName}`}
        onPress={onIncrement}
        style={[styles.btn, compact && styles.btnCompact]}
      >
        <Icon name="plus" color={glyph} size={16} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  solid: { backgroundColor: colors.olive },
  // Site stepper: square outline buttons, 8 radius.
  outline: {
    borderWidth: 1,
    borderColor: colors.borderButton,
    borderRadius: radius.sm,
  },
  btn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCompact: { width: 38, height: 44 },
  text: { ...typography.button, color: colors.ink },
  textSolid: { color: colors.onDark },
  qty: { minWidth: 16, textAlign: 'center' },
  unit: { ...typography.bodySmall, color: colors.textSecondary },
});
