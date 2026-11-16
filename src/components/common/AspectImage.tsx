import type { ReactNode } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme';

type Props = {
  source: ImageSourcePropType;
  // width / height, e.g. 16 / 9. The box is full width and never taller than
  // maxHeight, so no photo can grow to fill a phone screen.
  ratio: number;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

// Fixed-ratio image box, always full width. The ratio sits on an inner View
// (RN's Image ignores aspectRatio when the asset has an intrinsic size); the
// outer View caps the height and clips the centred overflow. Putting
// aspectRatio and maxHeight on one View made Yoga shrink the WIDTH once the
// cap applied, leaving an empty strip beside the photo.
// ponytail: RN Image, not expo-image, no new dependency.
export const AspectImage = ({
  source,
  ratio,
  maxHeight = 240,
  style,
  children,
}: Props) => (
  <View style={[styles.box, { maxHeight }, style]}>
    <View style={{ aspectRatio: ratio }}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  box: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  image: { width: '100%', height: '100%' },
});
