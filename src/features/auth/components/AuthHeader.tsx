import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

type Props = {
  stepNumber: number;
  onBack: () => void;
};

export const AuthHeader = ({ stepNumber, onBack }: Props) => (
  <View style={styles.row}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onBack}
      hitSlop={8}
      style={styles.back}
    >
      <Text style={styles.backText}>←</Text>
    </Pressable>
    <View style={styles.progress}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          style={[styles.segment, i <= stepNumber && styles.segmentOn]}
        />
      ))}
    </View>
    <Text style={styles.counter}>{stepNumber}/3</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 18, color: colors.ink },
  progress: { flex: 1, flexDirection: 'row', gap: 5 },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.disabledBg,
  },
  segmentOn: { backgroundColor: colors.ink },
  counter: {
    ...typography.kicker,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
