import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../../theme';
import { buildTimeline } from '../tracking';
import type { OrderStatus } from '../types';

// Mockup 6e2 STATUS block: dots on a rail, done/current in olive.
export const TrackingTimeline = ({ status }: { status: OrderStatus }) => (
  <View>
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
                step.state === 'current' && { backgroundColor: colors.white },
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
              step.state === 'current' && { color: tint },
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
  row: { flexDirection: 'row', gap: 12, minHeight: 40 },
  rail: { alignItems: 'center', width: 18 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
  },
  line: { flex: 1, width: 2, minHeight: 18, backgroundColor: colors.border },
  label: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    color: colors.ink,
    paddingBottom: 14,
  },
  upcoming: { color: colors.textDisabled },
});
