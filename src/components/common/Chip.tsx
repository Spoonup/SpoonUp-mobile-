import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  dotColor?: string;
};

export const Chip = ({ label, selected, onPress, dotColor }: Props) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ selected }}
    onPress={onPress}
    style={[styles.chip, selected && styles.chipOn]}
  >
    {dotColor ? (
      <View
        style={[
          styles.dot,
          { backgroundColor: selected ? colors.onDark : dotColor },
        ]}
      />
    ) : null}
    <Text style={[styles.label, selected && styles.labelOn]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { ...typography.label, color: colors.ink },
  labelOn: { color: colors.onDark },
});
