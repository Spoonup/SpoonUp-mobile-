import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { Icon, type IconName } from '../../../components/common/Icon';
import { Skeleton } from '../../../components/common/Skeleton';
import { Stepper } from '../../../components/common/Stepper';
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useCart } from '../../cart/context/CartContext';
import { splitUnit, type Product } from '../data/products';
import { useProduct } from '../hooks/useProducts';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

const MAX_QTY = 20;
const IMAGE_SHARE = 0.45; // hero image takes about 45% of the screen height
const ROUND = 44; // overlay buttons; 48dp hit area via hitSlop

// Attribute chips: only facts the backend product really carries.
// DECISION (owner reference 17.png): no rating, discount pill, compare price
// or favourite heart. The public product (server/publicProduct.js) has no
// rating, MRP/compare price or veg flag, and there is no favourites endpoint.
export const attributes = (
  product: Product,
): { icon: IconName; label: string }[] => {
  const list: { icon: IconName; label: string }[] = [];
  // Every product reaching this screen is kitchen/immediate (see catalogService).
  if (product.category === 'now')
    list.push({ icon: 'truck', label: 'Eat now' });
  if (product.prepMinutes) {
    list.push({ icon: 'clock', label: `Ready in ${product.prepMinutes} min` });
  }
  if (product.canSubscribe) {
    list.push({ icon: 'calendar', label: 'Plan available' });
  }
  if (product.unit) list.push({ icon: 'jar', label: `Per ${product.unit}` });
  return list;
};

// DECISION: no size selector. Only pantry products carry sizes[] in the
// backend, pantry is sold in a separate app/site, and the cart holds product
// ids only (no sizeId), so kitchen products are always single-size.
export const ProductDetailsScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const footerPadding = useFooterPadding();
  const { height } = useWindowDimensions();
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useProduct(route.params.productId);
  const heroHeight = Math.round(height * IMAGE_SHARE);

  const back = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={navigation.goBack}
      hitSlop={4}
      style={[styles.round, { top: insets.top + spacing.sm }]}
    >
      <Icon name="back" color={colors.ink} size={20} />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <Skeleton height={heroHeight} borderRadius={0} />
        <View style={styles.sheet}>
          <Skeleton height={14} width="30%" />
          <Skeleton height={30} width="75%" />
          <Skeleton height={24} width="35%" />
          <Skeleton height={60} />
        </View>
        {back}
      </View>
    );
  }
  if (error || !product) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + ROUND + 16 }]}>
        <ErrorState onRetry={refetch} />
        {back}
      </View>
    );
  }

  const description = splitUnit(product.meta).text;
  const chips = attributes(product);
  const inCart = cart.quantityOf(product.id);
  const total = product.price * qty; // display only; the backend prices the cart
  const addToCart = () => {
    cart.add(product.id, qty);
    setQty(1);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={[styles.hero, { height: heroHeight }]}>
          <Image
            source={product.image}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View style={styles.sheet}>
          {product.categoryLabel ? (
            <Text style={styles.kicker}>
              {product.categoryLabel.toUpperCase()}
            </Text>
          ) : null}
          <Text accessibilityRole="header" style={styles.name}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatRupees(product.price)}</Text>
            {product.unit ? (
              <Text style={styles.unit}>{`per ${product.unit}`}</Text>
            ) : null}
          </View>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
          {chips.length > 0 ? (
            <View style={styles.chips}>
              {chips.map(chip => (
                <View
                  key={chip.label}
                  accessible
                  accessibilityLabel={chip.label}
                  style={styles.chip}
                >
                  <Icon name={chip.icon} color={colors.olive} size={22} />
                  <Text style={styles.chipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPadding }]}>
        {inCart > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${inCart} in your cart, view cart`}
            onPress={() => navigation.navigate('Cart')}
            style={styles.inCart}
          >
            <Text style={styles.inCartText}>{inCart} in your cart · </Text>
            <Text style={[styles.inCartText, styles.inCartLink]}>
              View cart
            </Text>
          </Pressable>
        ) : null}
        <View style={styles.bar}>
          <Stepper
            variant="outline"
            quantity={qty}
            unit={product.unit}
            itemName={product.name}
            quantityLabel={`Quantity ${qty}`}
            onIncrement={() => setQty(q => Math.min(MAX_QTY, q + 1))}
            onDecrement={() => setQty(q => Math.max(1, q - 1))}
          />
          <View style={styles.flex}>
            <Button
              variant="primary"
              label={`Add to cart · ${formatRupees(total)}`}
              accessibilityLabel={`Add ${qty} ${
                product.name
              } to cart, ${formatRupees(total)}`}
              onPress={addToCart}
            />
          </View>
        </View>
      </View>
      {back}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { width: '100%', backgroundColor: colors.surfaceMuted },
  heroImage: { width: '100%', height: '100%' },
  round: {
    position: 'absolute',
    left: spacing.lg,
    width: ROUND,
    height: ROUND,
    borderRadius: ROUND / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sheet: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  kicker: { ...typography.kicker, fontSize: 11, color: colors.olive },
  name: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.ink,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: 2,
  },
  price: {
    ...typography.amount,
    fontFamily: fontFamily.sansSemiBold,
    color: colors.ink,
  },
  unit: { ...typography.body, color: colors.textSecondary },
  description: {
    ...typography.bodyLarge,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  chip: { flex: 1, alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  chipText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  inCart: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inCartText: { ...typography.label, color: colors.textSecondary },
  inCartLink: { color: colors.olive },
});
