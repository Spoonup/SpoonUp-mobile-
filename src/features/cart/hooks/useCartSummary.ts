import { useQuery } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { cartService } from '../services/cartService';

export const useCartSummary = () => {
  const { lines } = useCart();
  const key = lines.map(line => `${line.product.id}:${line.quantity}`);
  return useQuery({
    queryKey: ['cart-summary', key],
    queryFn: () => cartService.getSummary(lines),
    enabled: lines.length > 0,
    placeholderData: previous => previous,
  });
};
