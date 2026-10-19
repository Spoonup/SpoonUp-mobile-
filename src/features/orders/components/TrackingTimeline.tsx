import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { buildTimeline } from '../tracking';
import type { OrderStatus } from '../types';

export const TrackingTimeline = ({ status }: { status: OrderStatus }) => (
  <View style={styles.wrap}>
    {buildTimeline(status).map((step, i, all) => {
      const reached = step.state !== 'upcoming';
      const bad = step.status === 'cancelled';
      const tint = bad ? colors.danger : colors.olive;
      return (
        <View
          key={step.status}
          style={styles.row}
          accessible
          accessibilityLabel={`${step.label}, ${
            step.state === 'done'
              ? 'completed'
              : step.state === 'current'
              ? 'current'
              : 'upcoming'
          }`}
        >
          <View style={styles.rail}>
            <View
              style={[
                styles.dot,
                reached && { backgroundColor: tint, borderColor: tint },
              ]}
            />
            {i < all.length - 1 ? (
              <View
                style={[
                  styles.line,
                  step.state === 'done' && { backgroundColor: tint },
                ]}
              />
            ) : null}
          </View>
          <Text
            style={[
              styles.label,
              !reached && styles.upcoming,
              step.state === 'current' && styles.current,
            ]}
          >
            {step.label}
          </Text>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md, minHeight: 48 },
  rail: { alignItems: 'center', width: 16 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
  },
  line: { flex: 1, width: 2, backgroundColor: colors.border },
  label: { ...typography.body, color: colors.ink, marginTop: -2 },
  current: { ...typography.label },
  upcoming: { color: colors.textDisabled },
});
