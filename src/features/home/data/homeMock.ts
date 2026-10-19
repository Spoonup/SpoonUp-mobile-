// MOCK home data from the Claude Design handoff (6b). Replace with API data
// (user profile, location) when wired. Plan state comes from planService.
export const HOME_MOCK = {
  firstName: 'Priya',
  initials: 'P',
  isNewUser: true,
  location: { pincode: '560102', area: 'HSR Layout', eta: '~40 min' },
} as const;
