import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { colors, fontFamily, spacing, typography } from '../../../theme';

type Props = {
  firstName: string;
  onStart: () => void;
};

export const DoneStep = ({ firstName, onStart }: Props) => (
  <View style={styles.wrap}>
    <View style={styles.check} accessibilityElementsHidden>
      <Text style={styles.checkText}>✓</Text>
    </View>
    <Text style={styles.headline}>Welcome, {firstName}</Text>
    <Text style={styles.sub}>
      You’re all set. Pantry orders ship to your pincode in 3–5 days.
    </Text>
    <View style={styles.footer}>
      <Button label="Order your first breakfast →" onPress={onStart} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: spacing.lg,
  },
  check: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 38, color: colors.onDark },
  headline: {
    fontFamily: fontFamily.serif,
    fontSize: 36,
    lineHeight: 39,
    color: colors.ink,
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  footer: { alignSelf: 'stretch', marginTop: spacing.lg },
});
