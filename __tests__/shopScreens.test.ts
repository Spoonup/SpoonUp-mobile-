import { attributes } from '../src/features/shop/screens/ProductDetailsScreen';
import { splitUnit } from '../src/features/shop/data/products';
import { catalogService } from '../src/features/shop/services/catalogService';

test('splitUnit pulls the sold-per unit out of the backend description', () => {
  expect(splitUnit('Chilled coffee. (Per bottle)')).toEqual({
    text: 'Chilled coffee.',
    unit: 'bottle',
  });
  expect(splitUnit('No unit here.')).toEqual({ text: 'No unit here.' });
});

// DECISION: pantry sold in a separate app/site.
test('catalog never returns pantry (ships) products or lets one open', async () => {
  const list = await catalogService.list();
  expect(list.length).toBeGreaterThan(0);
  expect(list.every(p => p.category === 'now')).toBe(true);
  await expect(catalogService.get('dry')).rejects.toThrow();
});

test('detail chips come only from backend product fields', () => {
  const base = {
    id: 'x',
    name: 'X',
    price: 1,
    meta: '',
    image: 1,
    category: 'now' as const,
    canSubscribe: false,
  };
  expect(attributes(base).map(c => c.label)).toEqual(['Eat now']);
  expect(
    attributes({
      ...base,
      canSubscribe: true,
      prepMinutes: 20,
      unit: 'jar',
    }).map(c => c.label),
  ).toEqual(['Eat now', 'Ready in 20 min', 'Plan available', 'Per jar']);
});
