import { useRefresh } from '../../../hooks/useRefresh';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartIcon, SearchIcon } from '../../../components/common/Icon';
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

// Mockup 6c filters: All, Eat now, Subscribe (plan-able). The mockup's Pantry
// filter is intentionally absent (pantry is sold in a separate app/site).
const FILTERS: { key: ShopCategory; label: string; dot: string }[] = [
  { key: 'all', label: 'All', dot: colors.textDisabled },
  { key: 'now', label: 'Eat now', dot: colors.olive },
  { key: 'plan', label: 'Subscribe', dot: colors.ink },
];
const PLAN_NOTE =
  'Tap “Plan it” on any of these to pick how often. Pay once for 30 days.';

const SKELETONS = [0, 1, 2, 3];

export const ShopScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const { width } = useWindowDimensions();
  // Fixed cell width keeps a lone last card from stretching across the row.
  const cell = Math.floor((width - spacing.xl * 2 - 11) / 2);
  const { data, isLoading, error, refetch } = useProducts();
  const pull = useRefresh(refetch);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ShopCategory>('all');

  const routeCategory = route.params?.category;
  useEffect(() => {
    if (routeCategory) setCategory(routeCategory);
  }, [routeCategory]);

  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data ?? []).filter(
      product =>
        (category === 'all' ||
          (category === 'plan'
            ? product.canSubscribe
            : product.category === category)) &&
        (!needle || product.name.toLowerCase().includes(needle)),
    );
  }, [data, category, query]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletons}>
          {SKELETONS.map(key => (
            <View key={key} style={styles.skeleton}>
              <Skeleton height={230} borderRadius={14} />
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
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        {...pull}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <EmptyState
            title="Nothing found"
            message={
              query
                ? `Nothing matches “${query}”. Try “chia” or “smoothie”.`
                : 'No products in this category yet.'
            }
            actionLabel={query ? 'Clear search' : undefined}
            onAction={query ? () => setQuery('') : undefined}
          />
        }
        renderItem={({ item }) => (
          <View style={{ width: cell }}>
            <ProductCard
              product={item}
              quantity={cart.quantityOf(item.id)}
              onPress={() =>
                navigation.navigate('ProductDetails', { productId: item.id })
              }
              onAdd={() => cart.add(item.id)}
              onRemove={() => cart.remove(item.id)}
              onPlan={() =>
                navigation.navigate('NewPlan', { productId: item.id })
              }
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
        <View style={styles.searchWrap}>
          <SearchIcon color={colors.textMuted} />
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
        </View>
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
        {category === 'plan' ? (
          <Text style={styles.note}>{PLAN_NOTE}</Text>
        ) : null}
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
    lineHeight: 34,
    color: colors.ink,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderInput,
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
  badgeText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 10,
    color: colors.onDark,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  search: {
    flex: 1,
    minHeight: 46,
    color: colors.ink,
    fontFamily: fontFamily.sans,
    fontSize: 13.5,
  },
  chips: { gap: 7, paddingRight: spacing.xl },
  note: { ...typography.labelSmall, color: colors.textSecondary },
  body: { flex: 1 },
  column: { gap: 11 },
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: 11,
  },
  skeletons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    paddingHorizontal: spacing.xl,
  },
  skeleton: { width: '47.5%' },
});
