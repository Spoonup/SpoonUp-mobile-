import {
  Image,
  KeyboardAvoidingView,
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
import { useFooterPadding } from '../../../hooks/useFooterPadding';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useAuth } from '../../auth/context/AuthContext';
import { CouponSection } from '../../checkout/components/CouponSection';
import { DeliveryPicker } from '../../checkout/components/DeliveryPicker';
import { CreditToggle } from '../../credit/components/CreditToggle';
import { useCreditOffer } from '../../credit/hooks/useCredit';
import { payableBeforeCredit, withCredit } from '../../credit/logic';
import { useCheckoutDraft } from '../../checkout/hooks/useCheckoutDraft';
import { useCart } from '../context/CartContext';
import { useCartSummary } from '../hooks/useCartSummary';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

// DECISION: pantry sold in a separate app/site, so the only group is Eat now.
// The credit toggle follows the website: the amount is the customer's
// backend credit, applied to the whole payable (the mockup's "eat-now items"
// wording is not used). Cash on delivery and Cashfree: see CheckoutScreen.
export const CartScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const footerPad = useFooterPadding();
  const cart = useCart();
  const { isAuthenticated } = useAuth();
  const summary = useCartSummary();
  const { checkout, address, delivery, option } = useCheckoutDraft();
  const offer = useCreditOffer(
    summary.data ? payableBeforeCredit(summary.data) : undefined,
  );

  const goCheckout = () =>
    isAuthenticated
      ? navigation.navigate('Checkout')
      : navigation.navigate('Auth', { returnTo: 'Checkout' });

  const header = (
    <ScreenHeader
      title="Cart"
      onBack={navigation.goBack}
      right={
        cart.count > 0 ? (
          <Text style={styles.count}>{cart.count} in cart</Text>
        ) : undefined
      }
    />
  );

  if (cart.count === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          title="Your cart is empty"
          message="Nothing here yet. The kitchen is warm and ready when you are."
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

  const lines = cart.lines.filter(line => line.product.category === 'now');
  const scheduled = option?.kind === 'scheduled';
  const timing = scheduled ? `Scheduled · ${option?.label}` : 'Immediate';

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
    return <BillSummary summary={withCredit(summary.data, offer.applied)} />;
  };

  const total = summary.data && withCredit(summary.data, offer.applied);
  const ctaLabel = !isAuthenticated
    ? 'Log in to checkout'
    : total && !total.finalAtPayment
    ? `Checkout · ${formatRupees(total.total)}`
    : 'Checkout';

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior="padding"
    >
      {header}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.tag}>EAT NOW</Text>
            <Text style={styles.timing} numberOfLines={1}>
              {timing}
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
                  {formatRupees(product.price * quantity)}
                  {quantity > 1 ? ` · ${formatRupees(product.price)} each` : ''}
                </Text>
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
          <View style={styles.pickerWrap}>
            <DeliveryPicker
              options={delivery.data}
              selectedId={option?.id}
              isLoading={delivery.isLoading}
              isError={delivery.isError}
              onSelect={checkout.setDeliveryOptionId}
              onRetry={() => delivery.refetch()}
            />
          </View>
        </View>
        {isAuthenticated ? (
          <View style={styles.deliverTo}>
            <View style={styles.deliverText}>
              <Text style={styles.name}>
                {address ? `Deliver to ${address.name}` : 'Delivery address'}
              </Text>
              <Text style={styles.price}>
                {address
                  ? `${address.line1}, ${address.city} · ${address.pincode}`
                  : 'Add where we should deliver.'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={address ? 'Change address' : 'Add address'}
              onPress={() =>
                address
                  ? navigation.navigate('Addresses', { select: true })
                  : navigation.navigate('AddressForm')
              }
              style={styles.change}
            >
              <Text style={styles.changeText}>
                {address ? 'Change' : 'Add'}
              </Text>
            </Pressable>
          </View>
        ) : null}
        <CouponSection
          appliedCode={checkout.couponCode}
          onApplied={checkout.setCouponCode}
        />
        <CreditToggle offer={offer} />
        {renderBill()}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <Text style={styles.footNote}>
          {isAuthenticated
            ? 'You pay online on the next step.'
            : 'Log in to pay. Your cart is kept.'}
        </Text>
        <Button
          variant="dark"
          // DECISION: matches website, differs from CLAUDE.md: the site allows
          // guest checkout. Guest checkout is not built; guests sign in first.
          label={ctaLabel}
          onPress={goCheckout}
          disabled={!summary.data || (isAuthenticated && !option)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  count: { ...typography.body, color: colors.textSecondary },
  content: { gap: spacing.md, padding: spacing.xl, paddingTop: 0 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    minHeight: 40,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.tagNowBg,
  },
  tag: { ...typography.kicker, fontSize: 11, color: colors.textMuted },
  timing: {
    ...typography.labelSmall,
    flexShrink: 1,
    color: colors.tagNow,
    textAlign: 'right',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
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
  price: { ...typography.bodySmall, color: colors.textSecondary },
  pickerWrap: { borderTopWidth: 1, borderTopColor: colors.divider },
  deliverTo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  deliverText: { flex: 1, gap: 4 },
  change: { minWidth: 48, minHeight: 48, justifyContent: 'center' },
  changeText: { ...typography.label, color: colors.olive },
  billError: { ...typography.label, color: colors.danger, textAlign: 'center' },
  footer: {
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footNote: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
