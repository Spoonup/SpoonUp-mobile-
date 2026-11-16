import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AspectImage } from '../../../components/common/AspectImage';
import { Icon } from '../../../components/common/Icon';
import { colors, fontFamily, typography } from '../../../theme';
import { TILE_GAP } from '../logic';

export type CategoryTile = {
  key: string;
  kicker: string;
  label: string;
  sub: string;
  image: number;
  onPress: () => void;
};

type Props = { tiles: CategoryTile[] };

// Approved app design (6b): two equal-width tiles filling the row.
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
        <AspectImage source={tile.image} ratio={2} maxHeight={96} />
        <View style={styles.text}>
          <Text style={styles.kicker}>{tile.kicker}</Text>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{tile.label}</Text>
            <Icon name="chevronRight" color={colors.ink} size={14} />
          </View>
          <Text style={styles.sub}>{tile.sub}</Text>
        </View>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: TILE_GAP },
  tile: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  pressed: { opacity: 0.85 },
  text: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 14, gap: 3 },
  kicker: {
    ...typography.tag,
    fontSize: 10,
    color: colors.ink,
    letterSpacing: 1.4,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  sub: { ...typography.bodySmall, color: colors.textMuted },
});
