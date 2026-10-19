import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type CheckoutContextValue = {
  addressId: string | null;
  deliveryOptionId: string | null;
  couponCode: string | null;
  setAddressId: (id: string | null) => void;
  setDeliveryOptionId: (id: string | null) => void;
  setCouponCode: (code: string | null) => void;
  reset: () => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

// Holds the customer's selections only; every price comes from the backend.
export const CheckoutProvider = ({ children }: { children: ReactNode }) => {
  const [addressId, setAddressId] = useState<string | null>(null);
  const [deliveryOptionId, setDeliveryOptionId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAddressId(null);
    setDeliveryOptionId(null);
    setCouponCode(null);
  }, []);

  const value = useMemo(
    () => ({
      addressId,
      deliveryOptionId,
      couponCode,
      setAddressId,
      setDeliveryOptionId,
      setCouponCode,
      reset,
    }),
    [addressId, deliveryOptionId, couponCode, reset],
  );
  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = (): CheckoutContextValue => {
  const value = useContext(CheckoutContext);
  if (!value) {
    throw new Error('useCheckout must be used inside CheckoutProvider');
  }
  return value;
};
