import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { findProduct, type Product } from '../../shop/data/products';

type CartContextValue = {
  quantities: Record<string, number>;
  count: number;
  quantityOf: (productId: string) => number;
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  removeAll: (productId: string) => void;
  clear: () => void;
  lines: { product: Product; quantity: number }[];
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const add = useCallback((productId: string, quantity = 1) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + quantity,
    }));
  }, []);

  const remove = useCallback((productId: string) => {
    setQuantities(prev => {
      const next = { ...prev };
      const left = (next[productId] ?? 0) - 1;
      if (left <= 0) {
        delete next[productId];
      } else {
        next[productId] = left;
      }
      return next;
    });
  }, []);

  const removeAll = useCallback((productId: string) => {
    setQuantities(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }, []);

  const clear = useCallback(() => setQuantities({}), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = Object.entries(quantities).flatMap(([id, quantity]) => {
      const product = findProduct(id);
      return product ? [{ product, quantity }] : [];
    });
    return {
      quantities,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      quantityOf: id => quantities[id] ?? 0,
      add,
      remove,
      removeAll,
      clear,
      lines,
    };
  }, [quantities, add, remove, removeAll, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return value;
};
