import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { PaymentOutcome } from '../components/PaymentOutcome';

type FailedProps = NativeStackScreenProps<RootStackParamList, 'PaymentFailed'>;
type CancelledProps = NativeStackScreenProps<
  RootStackParamList,
  'PaymentCancelled'
>;

// Retry pops back to the existing Payment screen, reusing its idempotency key.
export const PaymentFailedScreen = ({ navigation }: FailedProps) => (
  <PaymentOutcome
    title="Payment failed"
    message="We couldn’t complete your payment and your order hasn’t been placed. If money was deducted, it will be refunded."
    onRetry={() => navigation.popTo('Payment')}
    onBack={() => navigation.popTo('Cart')}
  />
);

export const PaymentCancelledScreen = ({ navigation }: CancelledProps) => (
  <PaymentOutcome
    title="Payment cancelled"
    message="You cancelled the payment. Your cart is saved, so you can try again whenever you’re ready."
    onRetry={() => navigation.popTo('Payment')}
    onBack={() => navigation.popTo('Cart')}
  />
);
