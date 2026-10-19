import { useMutation, useQuery } from '@tanstack/react-query';
import { useCart } from '../../cart/context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { checkoutService } from '../services/checkoutService';
import { useAddresses } from './useAddresses';

export const useApplyCoupon = () =>
  useMutation({ mutationFn: checkoutService.applyCoupon });

// Resolves the customer's selections against backend data (falling back to
// the first available address/option) and fetches the backend quote.
export const useCheckoutDraft = () => {
  const { lines } = useCart();
  const checkout = useCheckout();
  const addresses = useAddresses();
  const address =
    addresses.data?.find(item => item.id === checkout.addressId) ??
    addresses.data?.[0];

  const delivery = useQuery({
    queryKey: [
      'delivery-options',
      lines.map(line => `${line.product.id}:${line.quantity}`),
      address?.id,
    ],
    queryFn: () => checkoutService.getDeliveryOptions(lines),
    enabled: lines.length > 0 && !!address,
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
      }),
    enabled: !!address && !!option,
    placeholderData: previous => previous,
  });

  return { lines, checkout, addresses, address, delivery, option, quote };
};
