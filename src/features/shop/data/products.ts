// MOCK catalog transcribed from the Claude Design handoff (6c). Replace with
// the backend's /api/products when the shop is wired to the API.
export type ProductCategory = 'now' | 'ships';

export type Product = {
  id: string;
  name: string;
  price: number;
  meta: string;
  category: ProductCategory;
  canSubscribe: boolean;
  image: number;
};

export const PRODUCTS: Product[] = [
  {
    id: 'pudding',
    name: 'Chocolate Protein Chia Pudding',
    price: 349,
    meta: '200 ml · 23g protein',
    category: 'now',
    canSubscribe: true,
    image: require('../../../assets/images/products/pudding-jar.png'),
  },
  {
    id: 'chia',
    name: 'Mango Chia Pudding',
    price: 299,
    meta: '200 ml · 12g protein',
    category: 'now',
    canSubscribe: true,
    image: require('../../../assets/images/products/chia.png'),
  },
  {
    id: 'dragon',
    name: 'Dragonfruit Smoothie',
    price: 329,
    meta: '300 ml · no added sugar',
    category: 'now',
    canSubscribe: true,
    image: require('../../../assets/images/products/dragonfruit-bottle.png'),
  },
  {
    id: 'smoothie',
    name: 'Green Glow Smoothie',
    price: 299,
    meta: '300 ml',
    category: 'now',
    canSubscribe: true,
    image: require('../../../assets/images/products/smoothie.png'),
  },
  {
    id: 'tikki',
    name: 'Sabudana Sweet Potato Tikki',
    price: 249,
    meta: '4 pc · air-fried',
    category: 'now',
    canSubscribe: false,
    image: require('../../../assets/images/products/tikki.png'),
  },
  {
    id: 'fries',
    name: 'Peri Peri House Fries',
    price: 349,
    meta: 'Baked, not fried',
    category: 'now',
    canSubscribe: false,
    image: require('../../../assets/images/products/fries.png'),
  },
  {
    id: 'dry',
    name: 'Kashmiri Dry Fruits',
    price: 899,
    meta: '500 g · sourced per order',
    category: 'ships',
    canSubscribe: false,
    image: require('../../../assets/images/products/dryfruit.png'),
  },
  {
    id: 'muesli',
    name: 'Kashmiri Muesli',
    price: 449,
    meta: '400 g',
    category: 'ships',
    canSubscribe: false,
    image: require('../../../assets/images/products/muesli.png'),
  },
  {
    id: 'modak',
    name: 'Dry Fruit Modak',
    price: 399,
    meta: 'Box of 6',
    category: 'ships',
    canSubscribe: false,
    image: require('../../../assets/images/products/modak.png'),
  },
];

export const findProduct = (id: string): Product | undefined =>
  PRODUCTS.find(product => product.id === id);
