import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';
import { PaymentOutcome } from '../../checkout/components/PaymentOutcome';

type FailedProps = NativeStackScreenProps<RootStackParamList, 'PlanFailed'>;
type CancelledProps = NativeStackScreenProps<
  RootStackParamList,
  'PlanCancelled'
>;

// Retry pops back to the existing PlanPayment screen (same idempotency key).
export const PlanFailedScreen = ({ navigation }: FailedProps) => (
  <PaymentOutcome
    title="Payment failed"
    message="We couldn’t complete your payment and your plan hasn’t started. If money was deducted, it will be returned."
    onRetry={() => navigation.popTo('PlanPayment')}
    onBack={() => navigation.popTo('MainTabs', { screen: 'Plans' })}
    backLabel="Back to plan"
  />
);

export const PlanCancelledScreen = ({ navigation }: CancelledProps) => (
  <PaymentOutcome
    title="Payment cancelled"
    message="You cancelled the payment, so nothing was charged. You can try again whenever you’re ready."
    onRetry={() => navigation.popTo('PlanPayment')}
    onBack={() => navigation.popTo('MainTabs', { screen: 'Plans' })}
    backLabel="Back to plan"
  />
);
