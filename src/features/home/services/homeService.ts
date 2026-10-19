import { HOME_MOCK } from '../data/homeMock';

export type HomeData = typeof HOME_MOCK;

// Lets tests/demos force a failed load.
export const mockHomeControls = { fail: false };

export const homeService = {
  // MOCK: replace with API (home content / profile / location).
  async get(): Promise<HomeData> {
    await new Promise<void>(resolve => setTimeout(resolve, 400));
    if (mockHomeControls.fail) throw new Error('Home failed to load');
    return HOME_MOCK;
  },
};
