// MOCK auth. No backend call yet. Replace bodies with the existing SpoonUp API
// (see SpoonUp-Website/server/index.js: /api/auth/*) when wiring real auth.
const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export class AuthError extends Error {}

export const authService = {
  async sendOtp(_phone: string): Promise<void> {
    await delay(600);
  },
  async verifyOtp(_phone: string, code: string): Promise<void> {
    await delay(800);
    if (code === '000000') {
      throw new AuthError('That code did not match.');
    }
  },
  async completeProfile(_input: {
    name: string;
    pincode: string;
    referralCode?: string;
  }): Promise<void> {
    await delay(500);
  },
};
