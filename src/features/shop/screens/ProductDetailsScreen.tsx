import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { Stepper } from '../../../components/common/Stepper';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useCart } from '../../cart/context/CartContext';
import { useProduct } from '../hooks/useProducts';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

const DELIVERY = {
  now: 'Fresh, delivered within minutes of ordering.',
  ships: 'Ships by courier in 3–5 days.',
} as const;

export const ProductDetailsScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useProduct(route.params.productId);
  const quantity = product ? cart.quantityOf(product.id) : 0;

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <Skeleton height={280} borderRadius={radius.xl} />
          <Skeleton height={28} width="70%" />
          <Skeleton height={16} width="40%" />
        </View>
      );
    }
    if (error || !product) return <ErrorState onRetry={refetch} />;
    return (
      <>
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={product.image}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>{product.meta}</Text>
          <Text style={styles.price}>{formatRupees(product.price)}</Text>
          <Text style={styles.delivery}>{DELIVERY[product.category]}</Text>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          {quantity > 0 ? (
            <>
              <Stepper
                variant="outline"
                quantity={quantity}
                itemName={product.name}
                onIncrement={() => cart.add(product.id)}
                onDecrement={() => cart.remove(product.id)}
              />
              <View style={styles.flex}>
                <Button
                  label="View cart"
                  onPress={() => navigation.navigate('Cart')}
                />
              </View>
            </>
          ) : (
            <View style={styles.flex}>
              <Button
                label="Add to cart"
                onPress={() => cart.add(product.id)}
              />
            </View>
          )}
        </View>
      </>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="" onBack={navigation.goBack} />
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  content: { gap: spacing.sm, padding: spacing.xl },
  image: {
    width: '100%',
    height: 280,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.md,
  },
  name: { ...typography.title, color: colors.ink },
  meta: { ...typography.body, color: colors.textSecondary },
  price: { ...typography.heading, fontSize: 18, color: colors.ink },
  delivery: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
