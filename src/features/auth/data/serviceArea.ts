// MOCK: pincode coverage copied from the design (6a). Replace with the backend's
// serviceability check (server/serviceability.js) when the API is wired.
export const SERVED_PINCODES: Record<string, { area: string; eta: string }> = {
  '560095': { area: 'Koramangala', eta: '~35 min' },
  '560034': { area: 'Koramangala', eta: '~35 min' },
  '560102': { area: 'HSR Layout', eta: '~40 min' },
  '560076': { area: 'BTM Layout', eta: '~40 min' },
  '560047': { area: 'Ejipura', eta: '~35 min' },
  '560038': { area: 'Indiranagar', eta: '~45 min' },
  '560103': { area: 'Bellandur', eta: '~45 min' },
};
