import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { colors, fontFamily, spacing, typography } from '../../../theme';

type Props = {
  onContinuePhone: () => void;
  onSkip: () => void;
  onTrackOrder: () => void;
};

export const WelcomeStep = ({
  onContinuePhone,
  onSkip,
  onTrackOrder,
}: Props) => (
  <View style={styles.wrap}>
    <View style={styles.hero}>
      <Image
        source={require('../../../assets/images/lifestyle/eat-now.jpg')}
        style={styles.heroImage}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
    <Image
      source={require('../../../assets/images/spoonup-logo.png')}
      style={styles.logo}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
    <Text style={styles.headline}>Eat healthy. Eat longer.</Text>
    <View style={styles.actions}>
      <Button label="Continue with phone" onPress={onContinuePhone} />
      <Pressable
        accessibilityRole="button"
        onPress={onSkip}
        hitSlop={8}
        style={styles.skip}
      >
        <Text style={styles.skipText}>Just browsing? Skip for now</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Track an order"
        onPress={onTrackOrder}
        hitSlop={8}
        style={styles.skip}
      >
        <Text style={styles.skipText}>Track an order</Text>
      </Pressable>
    </View>
    <Text style={styles.terms}>
      By continuing you accept our Terms and Privacy Policy.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.md },
  hero: {
    height: 300,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    marginTop: spacing.md,
  },
  heroImage: { width: '100%', height: '100%' },
  logo: { height: 40, alignSelf: 'center', marginTop: spacing.sm },
  headline: {
    fontFamily: fontFamily.serif,
    fontSize: 29,
    lineHeight: 32,
    color: colors.ink,
    textAlign: 'center',
  },
  actions: { gap: 12, marginTop: spacing.sm },
  skip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  skipText: { ...typography.label, color: colors.olive },
  terms: {
    ...typography.labelSmall,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
});
