import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BillSummary } from '../../../components/common/BillSummary';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { Stepper } from '../../../components/common/Stepper';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCartSummary } from '../hooks/useCartSummary';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

const SECTIONS = [
  {
    category: 'now',
    tag: 'NOW',
    note: 'Arrives in minutes',
    color: colors.tagNow,
    bg: colors.tagNowBg,
  },
  {
    category: 'ships',
    tag: 'SHIPS',
    note: 'Courier, 3–5 days',
    color: colors.tagShips,
    bg: colors.tagShipsBg,
  },
] as const;

export const CartScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const { isAuthenticated } = useAuth();
  const summary = useCartSummary();

  const checkout = () =>
    isAuthenticated
      ? navigation.navigate('Checkout')
      : navigation.navigate('Auth', { returnTo: 'Checkout' });

  const header = (
    <ScreenHeader
      title="Cart"
      onBack={navigation.goBack}
      right={<Text style={styles.count}>{cart.count} in cart</Text>}
    />
  );

  if (cart.count === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          title="Nothing here yet"
          message="Add something to eat now, or stock up on pantry items."
          actionLabel="Browse the shop"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
        />
      </View>
    );
  }

  const renderBill = () => {
    if (summary.isError) {
      return (
        <Pressable accessibilityRole="button" onPress={() => summary.refetch()}>
          <Text style={styles.billError}>
            Couldn’t load totals. Tap to retry.
          </Text>
        </Pressable>
      );
    }
    if (!summary.data) return <Skeleton height={64} />;
    return <BillSummary summary={summary.data} />;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map(section => {
          const lines = cart.lines.filter(
            line => line.product.category === section.category,
          );
          if (lines.length === 0) return null;
          return (
            <View key={section.category} style={styles.card}>
              <View style={[styles.cardHead, { backgroundColor: section.bg }]}>
                <Text style={[styles.tag, { color: section.color }]}>
                  {section.tag}
                </Text>
                <Text style={[styles.note, { color: section.color }]}>
                  {section.note}
                </Text>
              </View>
              {lines.map(({ product, quantity }) => (
                <View key={product.id} style={styles.line}>
                  <Image
                    source={product.image}
                    style={styles.thumb}
                    accessibilityIgnoresInvertColors
                  />
                  <View style={styles.lineInfo}>
                    <Text style={styles.name} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.price}>
                      {formatRupees(product.price)}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${product.name} from cart`}
                      onPress={() => cart.removeAll(product.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 16 }}
                    >
                      <Text style={styles.remove}>Remove</Text>
                    </Pressable>
                  </View>
                  <Stepper
                    variant="outline"
                    quantity={quantity}
                    itemName={product.name}
                    onIncrement={() => cart.add(product.id)}
                    onDecrement={() => cart.remove(product.id)}
                  />
                </View>
              ))}
            </View>
          );
        })}
        {renderBill()}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label={isAuthenticated ? 'Checkout' : 'Log in to checkout'}
          onPress={checkout}
          disabled={!summary.data}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  count: { ...typography.label, color: colors.textMuted },
  content: { gap: spacing.md, padding: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  tag: { ...typography.kicker },
  note: { ...typography.labelSmall },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 9,
    backgroundColor: colors.surfaceMuted,
  },
  lineInfo: { flex: 1, gap: 2 },
  name: { ...typography.label, color: colors.ink, lineHeight: 16 },
  price: { ...typography.heading, fontSize: 12, color: colors.ink },
  remove: {
    ...typography.labelSmall,
    color: colors.textMuted,
    paddingVertical: 4,
  },
  billError: { ...typography.label, color: colors.danger, textAlign: 'center' },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
