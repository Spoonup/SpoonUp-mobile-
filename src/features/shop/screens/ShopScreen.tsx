import { useRefresh } from '../../../hooks/useRefresh';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartIcon } from '../../../components/common/Icon';
import { Chip } from '../../../components/common/Chip';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ProductCard } from '../../../components/common/ProductCard';
import { Skeleton } from '../../../components/common/Skeleton';
import type {
  MainTabParamList,
  RootStackParamList,
  ShopCategory,
} from '../../../navigation/types';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';
import { useCart } from '../../cart/context/CartContext';
import { CartBar } from '../components/CartBar';
import { useProducts } from '../hooks/useProducts';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Shop'>,
  NativeStackScreenProps<RootStackParamList>
>;

// 'plan' (subscribe) is intentionally absent: plan model is an open spec
// conflict, so the Home "30-day plan" tile falls back to All.
const FILTERS: { key: ShopCategory; label: string; dot: string }[] = [
  { key: 'all', label: 'All', dot: colors.textDisabled },
  { key: 'now', label: 'Eat now', dot: colors.tagNow },
  { key: 'ships', label: 'Pantry', dot: colors.tagShips },
];

const NOTES: Record<string, string> = {
  all: 'Eat-now items arrive in minutes · pantry ships in 3–5 days',
  now: 'Fresh and made to order, delivered to your door',
  ships: 'Ships by courier in 3–5 days',
};

type Sort = 'featured' | 'low' | 'high';
// Display-only ordering of what the backend returned; prices stay backend-owned.
const SORTS: { key: Sort; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'low', label: 'Price: low to high' },
  { key: 'high', label: 'Price: high to low' },
];

const SKELETONS = [0, 1, 2, 3];

export const ShopScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const { data, isLoading, error, refetch } = useProducts();
  const pull = useRefresh(refetch);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ShopCategory>('all');
  const [sort, setSort] = useState<Sort>('featured');

  const routeCategory = route.params?.category;
  useEffect(() => {
    if (routeCategory)
      setCategory(routeCategory === 'plan' ? 'all' : routeCategory);
  }, [routeCategory]);

  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const found = (data ?? []).filter(
      product =>
        (category === 'all' || product.category === category) &&
        (!needle || product.name.toLowerCase().includes(needle)),
    );
    if (sort === 'low') return [...found].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...found].sort((a, b) => b.price - a.price);
    return found;
  }, [data, category, query, sort]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.grid}>
          {SKELETONS.map(key => (
            <View key={key} style={styles.skeleton}>
              <Skeleton height={190} borderRadius={radius.lg} />
            </View>
          ))}
        </View>
      );
    }
    if (error) return <ErrorState onRetry={refetch} />;
    return (
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={product => product.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        {...pull}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View>
            <EmptyState
              title="Nothing found"
              message={
                query
                  ? `Nothing matches “${query}”. Try “chia” or “dry fruits”.`
                  : 'No products in this category yet.'
              }
              actionLabel={query ? 'Clear search' : undefined}
              onAction={query ? () => setQuery('') : undefined}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard
              product={item}
              quantity={cart.quantityOf(item.id)}
              onPress={() =>
                navigation.navigate('ProductDetails', { productId: item.id })
              }
              onAdd={() => cart.add(item.id)}
              onRemove={() => cart.remove(item.id)}
            />
          </View>
        )}
      />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text accessibilityRole="header" style={styles.title}>
            Shop
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              cart.count > 0 ? `Cart, ${cart.count} items` : 'Cart'
            }
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartBtn}
          >
            <CartIcon color={colors.ink} />
            {cart.count > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cart.count}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        <TextInput
          accessibilityLabel="Search products"
          value={query}
          onChangeText={setQuery}
          placeholder="Search puddings, smoothies, dry fruits…"
          placeholderTextColor={colors.textDisabled}
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={styles.search}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map(filter => (
            <Chip
              key={filter.key}
              label={filter.label}
              dotColor={filter.dot}
              selected={category === filter.key}
              onPress={() => setCategory(filter.key)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chips}
          accessibilityLabel="Sort products"
        >
          {SORTS.map(option => (
            <Chip
              key={option.key}
              label={option.label}
              selected={sort === option.key}
              onPress={() => setSort(option.key)}
            />
          ))}
        </ScrollView>
        <Text style={styles.note}>{NOTES[category]}</Text>
      </View>
      <View style={styles.body}>{renderBody()}</View>
      <CartBar onPress={() => navigation.navigate('Cart')} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  top: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: 30,
    lineHeight: 33,
    color: colors.ink,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...typography.labelSmall, fontSize: 10, color: colors.onDark },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: fontFamily.sans,
    fontSize: 13.5,
  },
  chips: { gap: 7, paddingRight: spacing.xl },
  note: { ...typography.bodySmall, color: colors.textSecondary },
  body: { flex: 1 },
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 11,
  },
  row: { gap: 11 },
  // flex 0.5: two cards fill the row, a lone last card stays half width.
  cell: { flex: 0.5 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    paddingHorizontal: spacing.xl,
  },
  skeleton: { width: '47.5%' },
});
