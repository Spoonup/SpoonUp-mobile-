import AsyncStorage from '@react-native-async-storage/async-storage';

// Mirrors the website (src/lib/api.js rememberOrders): the backend lets
// anyone holding an order's secret accessToken read it back via the
// `x-order-token` header, with no sign-in. Returned to the placer at checkout;
// stored per device. Capability tokens, not account credentials.
const KEY = 'spoonup.orderTokens';
const MAX = 40;

export type RememberedOrder = {
  id: string;
  accessToken: string;
  orderNumber?: number | string;
};

const read = async (): Promise<RememberedOrder[]> => {
  try {
    const parsed = JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const orderTokens = {
  list: read,
  async tokenFor(id: string): Promise<string | undefined> {
    return (await read()).find(o => o.id === id)?.accessToken;
  },
  async remember(orders: RememberedOrder[]): Promise<void> {
    const fresh = orders.filter(o => o.id && o.accessToken);
    if (!fresh.length) return;
    const ids = new Set(fresh.map(o => o.id));
    const merged = [...fresh, ...(await read()).filter(o => !ids.has(o.id))];
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(merged.slice(0, MAX)));
    } catch {
      // storage unavailable: tracking falls back to the account (bearer).
    }
  },
};
