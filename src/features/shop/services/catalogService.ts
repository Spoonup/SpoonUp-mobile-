import { PRODUCTS, findProduct, type Product } from '../data/products';

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 400));

export const catalogService = {
  // MOCK: replace with API (GET /products). Prices and stock are backend-owned.
  async list(): Promise<Product[]> {
    await delay();
    return PRODUCTS;
  },
  // MOCK: replace with API (GET /products/:id).
  async get(id: string): Promise<Product> {
    await delay();
    const product = findProduct(id);
    if (!product) throw new Error('Product not found');
    return product;
  },
};
