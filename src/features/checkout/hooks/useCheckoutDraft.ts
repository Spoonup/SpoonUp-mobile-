import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/context/AuthContext';
import { useCart } from '../../cart/context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { checkoutService } from '../services/checkoutService';
import { useAddresses } from './useAddresses';

export const useApplyCoupon = () => {
  const { lines } = useCart();
  return useMutation({
    mutationFn: (code: string) => checkoutService.applyCoupon(code, lines),
  });
};

// Resolves the customer's selections against backend data (falling back to
// the first available address/option) and fetches the backend quote.
export const useCheckoutDraft = () => {
  const { lines } = useCart();
  const checkout = useCheckout();
  const { isAuthenticated } = useAuth();
  const addresses = useAddresses(isAuthenticated);
  const address =
    addresses.data?.find(item => item.id === checkout.addressId) ??
    addresses.data?.[0];

  const delivery = useQuery({
    queryKey: [
      'delivery-options',
      lines.map(line => `${line.product.id}:${line.quantity}`),
    ],
    queryFn: () => checkoutService.getDeliveryOptions(lines),
    enabled: lines.length > 0,
  });
  const option =
    delivery.data?.find(item => item.id === checkout.deliveryOptionId) ??
    delivery.data?.[0];

  const quote = useQuery({
    queryKey: [
      'checkout-quote',
      lines.map(line => `${line.product.id}:${line.quantity}`),
      address?.id,
      option?.id,
      checkout.couponCode,
    ],
    queryFn: () =>
      checkoutService.getQuote({
        lines,
        addressId: address!.id,
        deliveryOptionId: option!.id,
        couponCode: checkout.couponCode,
        scheduledFor: option!.scheduledFor,
      }),
    enabled: !!address && !!option,
    placeholderData: previous => previous,
  });

  return { lines, checkout, addresses, address, delivery, option, quote };
};
