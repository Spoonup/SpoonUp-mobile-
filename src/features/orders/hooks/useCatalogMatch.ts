import { useCallback, useMemo } from 'react';
import { useProducts } from '../../shop/hooks/useProducts';
import type { Product } from '../../shop/data/products';
import type { Order } from '../types';

const FALLBACK = require('../../../assets/images/products/chia.png');

// Orders carry item names only; photos and reorder ids come from the live
// catalog by name (same matching Home's "Order again" uses).
export const useCatalogMatch = () => {
  const { data } = useProducts();
  const byName = useMemo(
    () => new Map((data ?? []).map(p => [p.name.toLowerCase(), p])),
    [data],
  );
  const find = useCallback(
    (name: string): Product | undefined => byName.get(name.toLowerCase()),
    [byName],
  );
  const imageOf = useCallback(
    (name: string) => find(name)?.image ?? FALLBACK,
    [find],
  );
  // Catalog lines for reorder: only items still sold.
  const reorderLines = useCallback(
    (order: Order) =>
      order.items.flatMap(item => {
        const product = find(item.name);
        return product ? [{ id: product.id, quantity: item.quantity }] : [];
      }),
    [find],
  );
  return { imageOf, reorderLines };
};
