import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BillSummary } from '../../../components/common/BillSummary';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
import { AddressCard } from '../components/AddressCard';
import { CouponSection } from '../components/CouponSection';
import { DeliverySection } from '../components/DeliverySection';
import { Section } from '../components/Section';
import { useCheckoutDraft } from '../hooks/useCheckoutDraft';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export const CheckoutScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const offline = useOffline();
  const { lines, checkout, addresses, address, delivery, option, quote } =
    useCheckoutDraft();

  const header = <ScreenHeader title="Checkout" onBack={navigation.goBack} />;

  if (lines.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        {header}
        <EmptyState
          title="Your cart is empty"
          message="Add something before checking out."
          actionLabel="Browse the shop"
          onAction={() => navigation.navigate('MainTabs', { screen: 'Shop' })}
        />
      </View>
    );
  }

  const renderAddress = () => {
    if (addresses.isError) {
      return (
        <Button
          variant="outline"
          label="Couldn’t load addresses. Retry"
          onPress={() => addresses.refetch()}
        />
      );
    }
    if (addresses.isLoading) return <Skeleton height={64} />;
    if (!address) {
      return (
        <Button
          variant="outline"
          label="Add a delivery address"
          onPress={() => navigation.navigate('AddressForm')}
        />
      );
    }
    return (
      <>
        <AddressCard address={address} />
        <Button
          variant="outline"
          label="Change address"
          onPress={() => navigation.navigate('Addresses', { select: true })}
        />
      </>
    );
  };

  const renderSummary = () => {
    if (quote.isError) {
      return (
        <Button
          variant="outline"
          label="Couldn’t load totals. Retry"
          onPress={() => quote.refetch()}
        />
      );
    }
    if (!quote.data) {
      return address && option ? (
        <Skeleton height={64} />
      ) : (
        <Text style={styles.note}>
          Choose an address and delivery option to see your total.
        </Text>
      );
    }
    return <BillSummary summary={quote.data} />;
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {header}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Section title="Delivery address">{renderAddress()}</Section>
        <DeliverySection
          options={delivery.data}
          selectedId={option?.id}
          isLoading={delivery.isLoading}
          isError={delivery.isError}
          needsAddress={!address}
          onSelect={checkout.setDeliveryOptionId}
          onRetry={() => delivery.refetch()}
        />
        <CouponSection
          appliedCode={checkout.couponCode}
          onApplied={checkout.setCouponCode}
        />
        <Section title="Order summary">{renderSummary()}</Section>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label="Continue to payment"
          onPress={() => navigation.navigate('Payment')}
          disabled={!quote.data || offline}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  note: { ...typography.bodySmall, color: colors.textSecondary },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
