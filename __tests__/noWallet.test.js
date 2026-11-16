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

// Owner decision (2026-11): the wallet concept is dropped; SpoonUp credit and
// referrals follow the website/backend. CLAUDE.md section 13 "no customer-facing
// wallet" is superseded for credit. Still banned everywhere: wallet, top-up,
// withdraw, auto-renew, recurring wording. "balance" is the backend field name
// of GET /api/me/store-credit, so it is allowed only in the credit data layer
// below (screens read it through hooks as "credit"/"available").
const CREDIT_DATA_FILES = [
  'features/credit/types.ts',
  'features/credit/services/creditService.ts',
];

test('no wallet, top-up, withdraw, balance or recurring wording in src', () => {
  const banned =
    /wallet|top-?up|withdraw|balance|auto-?renew|recurring|subscription/i;
  const hits = walk(path.join(__dirname, '..', 'src')).filter(file => {
    const text = fs.readFileSync(file, 'utf8');
    const wire = WIRE_CONTRACT_FILES.some(f => file.endsWith(f));
    const credit = CREDIT_DATA_FILES.some(f => file.endsWith(f));
    return (
      wire
        ? /wallet|top-?up|withdraw|balance|auto-?renew|recurring/i
        : credit
        ? /wallet|top-?up|withdraw|auto-?renew|recurring|subscription/i
        : banned
    ).test(text);
  });
  expect(hits).toEqual([]);
});
