import { useQuery } from '@tanstack/react-query';
import { useCheckout } from '../../checkout/context/CheckoutContext';
import { useCart } from '../context/CartContext';
import { cartService } from '../services/cartService';

export const useCartSummary = () => {
  const { lines } = useCart();
  const { couponCode } = useCheckout();
  const key = lines.map(line => `${line.product.id}:${line.quantity}`);
  return useQuery({
    queryKey: ['cart-summary', key, couponCode],
    queryFn: () => cartService.getSummary(lines, couponCode),
    enabled: lines.length > 0,
    placeholderData: previous => previous,
  });
};
