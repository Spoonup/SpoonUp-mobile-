const fs = require('fs');
const path = require('path');

const walk = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

// Backend wire-contract identifiers (purchaseMode 'SUBSCRIPTION', the
// /api/me/subscriptions route, subscription rows) cannot be renamed. They stay
// in the plan/API layer only; customer-facing screens must not use the word.
const WIRE_CONTRACT_FILES = [
  'features/plan/logic.ts',
  'features/plan/types.ts',
  'features/plan/services/planService.ts',
  'services/api/endpoints.ts',
];

test('no wallet, top-up, balance or recurring wording in src', () => {
  const banned = /wallet|top-?up|balance|auto-?renew|recurring|subscription/i;
  const hits = walk(path.join(__dirname, '..', 'src')).filter(file => {
    const text = fs.readFileSync(file, 'utf8');
    const wire = WIRE_CONTRACT_FILES.some(f => file.endsWith(f));
    return (wire ? /wallet|top-?up|balance|auto-?renew|recurring/i : banned).test(
      text,
    );
  });
  expect(hits).toEqual([]);
});
