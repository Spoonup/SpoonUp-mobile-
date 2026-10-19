const delay = () => new Promise<void>(resolve => setTimeout(resolve, 500));

export const profileService = {
  // MOCK: replace with API (update current customer profile). Backend
  // validates and owns the stored name; phone is the login identity.
  async updateName(name: string): Promise<{ name: string }> {
    await delay();
    return { name: name.trim() };
  },
};
