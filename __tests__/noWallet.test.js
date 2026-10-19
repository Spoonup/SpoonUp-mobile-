const fs = require('fs');
const path = require('path');

const walk = dir =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

test('no wallet, top-up, balance or recurring wording in src', () => {
  const banned = /wallet|top-?up|balance|auto-?renew|recurring|subscription/i;
  const hits = walk(path.join(__dirname, '..', 'src')).filter(file =>
    banned.test(fs.readFileSync(file, 'utf8')),
  );
  expect(hits).toEqual([]);
});
