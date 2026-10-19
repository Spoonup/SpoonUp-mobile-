import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';

type Props = { onDismiss: () => void };

export const CoachMark = ({ onDismiss }: Props) => (
  <View style={styles.card} accessibilityRole="alert">
    <Text style={styles.title}>Your five tabs, just this once</Text>
    <Text style={styles.tabs}>Home · Shop · Orders · Plans · Account</Text>
    <View style={styles.footer}>
      <Text style={styles.body}>
        Account is the last tab. Your photo, top right, opens it too.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onDismiss}
        style={styles.gotIt}
      >
        <Text style={styles.gotItText}>Got it</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    gap: 9,
    shadowColor: colors.ink,
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  title: { ...typography.label, fontSize: 13, color: colors.onDark },
  tabs: {
    ...typography.labelSmall,
    color: colors.sageLight,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.onDarkSubtle,
  },
  body: {
    ...typography.bodySmall,
    fontSize: 11,
    lineHeight: 15,
    color: colors.onDarkMuted,
    flex: 1,
  },
  gotIt: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.sage,
  },
  gotItText: { ...typography.labelSmall, color: colors.ink, fontSize: 12 },
});
