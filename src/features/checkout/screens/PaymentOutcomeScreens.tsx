import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { formatRupees } from '../../../utils/money';
import { useCart } from '../../cart/context/CartContext';
import { PaymentOutcome } from '../components/PaymentOutcome';

type FailedProps = NativeStackScreenProps<RootStackParamList, 'PaymentFailed'>;
type CancelledProps = NativeStackScreenProps<
  RootStackParamList,
  'PaymentCancelled'
>;

// Retry pops back to the existing Checkout screen, reusing its idempotency
// key. TODO(api): mockup 6d4 also shows the provider's decline reason and
// payment id; the backend returns neither, so only known values are shown.
export const PaymentFailedScreen = ({ navigation, route }: FailedProps) => {
  const { amount, reference, reason } = route.params ?? {};
  const rows: [string, string][] = [
    ['Reason', reason ?? 'Payment couldn’t be verified'],
    ['Tried with', 'Razorpay'],
    ...(reference ? [['Reference', reference] as [string, string]] : []),
  ];
  return (
    <PaymentOutcome
      tone="failed"
      title="Payment failed"
      message={
        amount
          ? `We couldn’t complete your ${formatRupees(
              amount,
            )} payment. Your cart is saved, so you can try again.`
          : 'We couldn’t complete your payment and your order hasn’t been placed. Your cart is saved.'
      }
      rows={rows}
      note="If money left your account, it is refunded by your bank or as SpoonUp store credit."
      retryLabel={amount ? `Try again · ${formatRupees(amount)}` : 'Try again'}
      onRetry={() => navigation.popTo('Checkout')}
      backLabel="Back to cart"
      onBack={() => navigation.popTo('Cart')}
    />
  );
};

export const PaymentCancelledScreen = ({
  navigation,
  route,
}: CancelledProps) => {
  const { count } = useCart();
  const amount = route.params?.amount;
  const rows: [string, string][] = [
    ...(amount
      ? [['Order total', formatRupees(amount)] as [string, string]]
      : []),
    ['Items', String(count)],
  ];
  return (
    <PaymentOutcome
      tone="cancelled"
      title="Payment cancelled"
      message="You closed Razorpay before paying. Nothing was charged and your cart is just as you left it."
      rows={rows}
      retryLabel={amount ? `Pay ${formatRupees(amount)}` : 'Back to checkout'}
      onRetry={() => navigation.popTo('Checkout')}
      backLabel="Back to cart"
      onBack={() => navigation.popTo('Cart')}
    />
  );
};
