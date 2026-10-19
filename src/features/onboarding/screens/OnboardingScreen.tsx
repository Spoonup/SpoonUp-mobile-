import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appStorage } from '../../../services/storage/appStorage';
import { Button } from '../../../components/common/Button';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import type { RootStackParamList } from '../../../navigation/types';
import { ONBOARDING_SLIDES } from '../data/slides';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export const OnboardingScreen = ({ navigation }: Props) => {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const slide = ONBOARDING_SLIDES[index];
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const finish = async () => {
    await appStorage.markOnboardingSeen();
    navigation.replace('Auth');
  };

  const next = () => (isLast ? finish() : setIndex(index + 1));

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={styles.counter}>
          {index + 1}/{ONBOARDING_SLIDES.length}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={finish}
          hitSlop={12}
          style={styles.skip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View
          style={[styles.imageWrap, { height: Math.min(width * 0.87, 340) }]}
        >
          <Image
            source={slide.image}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
        <Text style={[styles.tag, { color: slide.tagColor }]}>{slide.tag}</Text>
        <Text style={styles.headline}>{slide.headline}</Text>
        <Text style={styles.bodyText}>{slide.body}</Text>
      </View>

      <View style={styles.footer}>
        <View
          style={styles.dots}
          accessibilityRole="adjustable"
          accessibilityLabel={`Slide ${index + 1} of ${
            ONBOARDING_SLIDES.length
          }`}
        >
          {ONBOARDING_SLIDES.map((_, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`Go to slide ${i + 1}`}
              onPress={() => setIndex(i)}
              hitSlop={8}
              style={[
                styles.dot,
                i === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
        {isLast ? (
          <View style={styles.cta}>
            <Button label="Get started" onPress={finish} />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next slide"
            onPress={next}
            style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
          >
            <Text style={styles.nextArrow}>→</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  counter: { ...typography.kicker, color: colors.textMuted },
  skip: { paddingVertical: spacing.sm, paddingLeft: spacing.md },
  skipText: { ...typography.label, color: colors.olive, fontSize: 13 },
  body: { flex: 1, paddingTop: spacing.md },
  imageWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: { width: '100%', height: '100%' },
  tag: { ...typography.kicker, marginTop: spacing.lg },
  headline: {
    fontFamily: fontFamily.serif,
    fontSize: 34,
    lineHeight: 37,
    color: colors.ink,
    marginTop: 10,
  },
  bodyText: {
    ...typography.body,
    fontSize: 13.5,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 7, borderRadius: 4 },
  dotActive: { width: 22, backgroundColor: colors.ink },
  dotInactive: { width: 7, backgroundColor: 'rgba(27, 42, 24, 0.2)' },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextArrow: { fontSize: 20, color: colors.onDark },
  pressed: { transform: [{ scale: 0.95 }] },
  cta: { flex: 1 },
});
