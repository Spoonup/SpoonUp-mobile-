import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appStorage } from '../../../services/storage/appStorage';
import { colors, fontFamily, typography } from '../../../theme';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_MS = 2000;

export const SplashScreen = ({ navigation }: Props) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_MS,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) setDone(true);
    });
    return () => animation.stop();
  }, [progress]);

  useEffect(() => {
    if (!done) return;
    appStorage.hasSeenOnboarding().then(seen => {
      navigation.replace(seen ? 'Auth' : 'Onboarding');
    });
  }, [done, navigation]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="SpoonUp. Continue"
      onPress={() => setDone(true)}
      style={styles.container}
    >
      <Image
        source={require('../../../assets/images/spoonup-logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Text style={styles.tagline}>Eat healthy. Eat longer.</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
      <Text style={styles.footer}>MADE FRESH IN BENGALURU</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  logo: { width: 220, height: 64 },
  tagline: {
    fontFamily: fontFamily.serifItalic,
    fontSize: 22,
    lineHeight: 26,
    color: colors.olive,
  },
  track: {
    position: 'absolute',
    bottom: 56,
    width: 64,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(27, 42, 24, 0.12)',
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.ink },
  footer: {
    ...typography.kicker,
    position: 'absolute',
    bottom: 26,
    color: colors.textDisabled,
  },
});
