import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type DimensionValue } from 'react-native';
import { colors, radius } from '../../theme';

type Props = {
  width?: DimensionValue;
  height: number;
  borderRadius?: number;
};

// Pulsing placeholder block shown while data loads.
export const Skeleton = ({ width = '100%', height, borderRadius }: Props) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.block,
        { width, height, borderRadius: borderRadius ?? radius.md, opacity },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  block: { backgroundColor: colors.sageLight },
});
