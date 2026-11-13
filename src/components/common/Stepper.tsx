import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';

type Props = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  itemName: string;
  // 'solid' = olive pill (shop card), 'outline' = bordered (cart row).
  variant?: 'solid' | 'outline';
};

export const Stepper = ({
  quantity,
  onIncrement,
  onDecrement,
  itemName,
  variant = 'solid',
}: Props) => {
  const solid = variant === 'solid';
  const textStyle = [styles.text, solid && styles.textSolid];
  return (
    <View style={[styles.wrap, solid ? styles.solid : styles.outline]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove one ${itemName}`}
        onPress={onDecrement}
        style={styles.btn}
      >
        <Text style={textStyle}>−</Text>
      </Pressable>
      <Text
        accessibilityLabel={`${quantity} in cart`}
        style={[textStyle, styles.qty]}
      >
        {quantity}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add one ${itemName}`}
        onPress={onIncrement}
        style={styles.btn}
      >
        <Text style={textStyle}>+</Text>
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...typography.button, color: colors.ink },
  textSolid: { color: colors.onDark },
  qty: { minWidth: 16, textAlign: 'center' },
});
