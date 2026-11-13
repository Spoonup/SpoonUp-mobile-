import { appConfig } from '../../../config/appConfig';
import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { mocksEnabled } from '../../../services/api/mode';
import {
  PRODUCTS,
  findProduct,
  rememberProducts,
  type Product,
} from '../data/products';

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 400));

// Backend product (GET /api/products, publicProduct allow-list).
type ApiProduct = {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  deliverLater?: boolean;
  fulfillmentKind?: 'IMMEDIATE' | 'DELIVERY_IN_DAYS';
  subscribable?: boolean;
};

const FALLBACK_IMAGE = require('../../../assets/images/products/chia.png');

const toProduct = (p: ApiProduct): Product => {
  const url = p.imageUrl?.startsWith('/')
    ? `${appConfig.env.apiBaseUrl}${p.imageUrl}`
    : p.imageUrl;
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    meta: p.description ?? '',
    category:
      p.fulfillmentKind === 'DELIVERY_IN_DAYS' || p.deliverLater
        ? 'ships'
        : 'now',
    canSubscribe: Boolean(p.subscribable),
    image: url ? { uri: url } : FALLBACK_IMAGE,
  };
};

export const catalogService = {
  async list(): Promise<Product[]> {
    if (mocksEnabled) {
      await delay();
      return PRODUCTS;
    }
    const data = await apiClient.get<ApiProduct[]>(endpoints.products);
    // Prices/availability are backend-owned; unavailable items are hidden.
    const products = data.filter(p => p.isAvailable !== false).map(toProduct);
    rememberProducts(products);
    return products;
  },
  async get(id: string): Promise<Product> {
    if (mocksEnabled) {
      await delay();
      const product = findProduct(id);
      if (!product) throw new Error('Product not found');
      return product;
    }
    // No single-product endpoint exists; the list is the source.
    const product = (await catalogService.list()).find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  },
};
