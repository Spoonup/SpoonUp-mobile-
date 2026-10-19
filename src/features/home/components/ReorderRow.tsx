import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import type { Product } from '../../shop/data/products';

const Separator = () => <View style={styles.separator} />;

type Item = { product: Product; quantity: number; onAdd: () => void };

type Props = {
  title: string;
  actionLabel: string;
  onAction: () => void;
  items: Item[];
};

export const ReorderRow = ({ title, actionLabel, onAction, items }: Props) => (
  <View style={styles.wrap}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
    <FlatList
      horizontal
      data={items}
      keyExtractor={item => item.product.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.imageWrap}>
            <Image
              source={item.product.image}
              style={styles.image}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${item.product.name}`}
              onPress={item.onAdd}
              hitSlop={10}
              style={[styles.addBtn, item.quantity > 0 && styles.addBtnOn]}
            >
              <Text
                style={[styles.addText, item.quantity > 0 && styles.addTextOn]}
              >
                {item.quantity > 0 ? `✓ ${item.quantity}` : '+'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={2}>
              {item.product.name}
            </Text>
            <Text style={styles.price}>{formatRupees(item.product.price)}</Text>
          </View>
        </View>
      )}
      ItemSeparatorComponent={Separator}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: { ...typography.heading, color: colors.ink },
  action: { ...typography.label, color: colors.olive },
  list: { paddingVertical: 2 },
  separator: { width: spacing.md },
  card: {
    width: 136,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  imageWrap: { height: 96, backgroundColor: colors.surfaceMuted },
  image: { width: '100%', height: '100%' },
  addBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    minWidth: 36,
    height: 36,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addBtnOn: { backgroundColor: colors.olive },
  addText: { ...typography.label, fontSize: 13, color: colors.ink },
  addTextOn: { color: colors.onDark },
  meta: { padding: 10, gap: 2 },
  name: {
    ...typography.label,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  price: { ...typography.label, fontSize: 12, color: colors.ink },
});
