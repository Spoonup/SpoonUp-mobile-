import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/context/AuthContext';
import { useCheckout } from '../../checkout/context/CheckoutContext';
import { creditService } from '../services/creditService';
import { creditToApply } from '../logic';

export const useCreditStatement = (enabled: boolean) =>
  useQuery({
    queryKey: ['store-credit'],
    queryFn: creditService.statement,
    enabled,
  });

export const useReferral = (enabled: boolean) =>
  useQuery({
    queryKey: ['referral'],
    queryFn: creditService.referral,
    enabled,
  });

// The credit toggle for a cart/checkout/plan payable amount. Signed-in only
// (the backend rejects credit for guests); the toggle choice is shared.
export const useCreditOffer = (payable: number | undefined) => {
  const { isAuthenticated } = useAuth();
  const { creditOn, setCreditOn } = useCheckout();
  const { data } = useCreditStatement(isAuthenticated);
  const available = data?.available ?? 0;
  const max = creditToApply(available, payable ?? 0);
  return {
    show: isAuthenticated && available > 0 && payable !== undefined,
    available,
    max,
    on: creditOn,
    setOn: setCreditOn,
    applied: creditOn ? max : 0,
  };
};
