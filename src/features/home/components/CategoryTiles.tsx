import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../theme';

export type CategoryTile = {
  key: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  label: string;
  sub: string;
  image: number;
  onPress: () => void;
};

type Props = { tiles: CategoryTile[] };

// Site "Three ways to eat with us": stacked white tiles, image + mono tag +
// serif title + one-line description.
export const CategoryTiles = ({ tiles }: Props) => (
  <View style={styles.col}>
    {tiles.map(tile => (
      <Pressable
        key={tile.key}
        accessibilityRole="button"
        accessibilityLabel={`${tile.label}, ${tile.sub}`}
        onPress={tile.onPress}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <Image
          source={tile.image}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.text}>
          <Text
            style={[
              styles.tag,
              { color: tile.tagColor, backgroundColor: tile.tagBg },
            ]}
          >
            {tile.tag}
          </Text>
          <Text style={styles.label}>{tile.label}</Text>
          <Text style={styles.sub}>{tile.sub}</Text>
        </View>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  col: { gap: 16 },
  tile: {
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  image: { width: '100%', aspectRatio: 2.1 },
  text: { padding: 20, gap: 8, alignItems: 'flex-start' },
  tag: {
    ...typography.tag,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  label: { ...typography.titleCard, color: colors.ink },
  sub: { ...typography.body, color: colors.textSecondary },
});
