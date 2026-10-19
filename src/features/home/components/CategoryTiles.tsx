import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, typography } from '../../../theme';

export type CategoryTile = {
  key: string;
  tag: string;
  tagColor: string;
  label: string;
  sub: string;
  image: number;
  onPress: () => void;
};

type Props = { tiles: CategoryTile[] };

export const CategoryTiles = ({ tiles }: Props) => (
  <View style={styles.row}>
    {tiles.map(tile => (
      <Pressable
        key={tile.key}
        accessibilityRole="button"
        accessibilityLabel={`${tile.label}, ${tile.sub}`}
        onPress={tile.onPress}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <View style={styles.imageWrap}>
          <Image
            source={tile.image}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={styles.text}>
          <Text style={[styles.tag, { color: tile.tagColor }]}>{tile.tag}</Text>
          <Text style={styles.label}>{tile.label} ›</Text>
          <Text style={styles.sub}>{tile.sub}</Text>
        </View>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 9 },
  tile: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  pressed: { transform: [{ scale: 0.97 }] },
  imageWrap: { height: 74 },
  image: { width: '100%', height: '100%' },
  text: { paddingHorizontal: 10, paddingTop: 9, paddingBottom: 11, gap: 2 },
  tag: { ...typography.tag, fontSize: 9.5 },
  label: { ...typography.label, fontSize: 12.5, color: colors.ink },
  sub: {
    ...typography.labelSmall,
    fontSize: 10.5,
    color: colors.textMuted,
    fontFamily: fontFamily.sans,
  },
});
