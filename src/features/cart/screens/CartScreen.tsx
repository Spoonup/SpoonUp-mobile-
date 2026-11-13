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
    tag: 'EAT NOW · FROM OUR KITCHEN',
    note: 'Timing is set at checkout',
    color: colors.tagNow,
    bg: colors.tagNowBg,
  },
  {
    category: 'ships',
    tag: 'PANTRY · SHIPS BY COURIER',
    note: 'Arrives in 3–5 days',
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

  const header = <ScreenHeader title="Your cart" onBack={navigation.goBack} />;

  if (cart.count === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          title="Your cart is empty"
          message="Nothing here yet. The kitchen is warm and the pantry is stocked."
          actionLabel="Browse the shop"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
          secondaryLabel="Build a plan"
          onSecondary={() =>
            navigation.navigate('MainTabs', { screen: 'Plans' })
          }
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
        <Text style={styles.sub}>
          {cart.count} {cart.count === 1 ? 'item' : 'items'}
        </Text>
        {SECTIONS.map(section => {
          const lines = cart.lines.filter(
            line => line.product.category === section.category,
          );
          if (lines.length === 0) return null;
          return (
            <View
              key={section.category}
              style={[styles.card, { borderLeftColor: section.color }]}
            >
              <View style={styles.cardHead}>
                <Text style={[styles.tag, { color: section.color }]}>
                  {section.tag}
                </Text>
                <Text style={styles.note}>{section.note}</Text>
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
                      {formatRupees(product.price)} each
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
                  <View style={styles.lineEnd}>
                    <Stepper
                      variant="outline"
                      quantity={quantity}
                      itemName={product.name}
                      onIncrement={() => cart.add(product.id)}
                      onDecrement={() => cart.remove(product.id)}
                    />
                    <Text style={styles.lineTotal}>
                      {formatRupees(product.price * quantity)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
        {renderBill()}
        <Text style={styles.hint}>
          Coupons and GST are applied at checkout.
        </Text>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          // DECISION: matches website, differs from CLAUDE.md: the site allows
          // guest checkout ("No account needed first"). Guest checkout is not
          // built; the app still asks guests to sign in, so that copy is not used.
          label={
            isAuthenticated ? 'Continue to checkout' : 'Log in to checkout'
          }
          onPress={checkout}
          disabled={!summary.data}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  sub: { ...typography.body, color: colors.textSecondary },
  hint: { ...typography.labelSmall, color: colors.textSecondary },
  content: { gap: spacing.md, padding: spacing.xl },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tag: { ...typography.tag, fontSize: 10.5 },
  note: { ...typography.labelSmall, color: colors.textSecondary },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  lineInfo: { flex: 1, gap: 2 },
  name: { ...typography.heading, color: colors.ink },
  price: { ...typography.labelSmall, color: colors.textSecondary },
  lineEnd: { alignItems: 'flex-end', gap: 6 },
  lineTotal: { ...typography.label, color: colors.ink },
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
