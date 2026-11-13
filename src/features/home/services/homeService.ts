import { mocksEnabled } from '../../../services/api/mode';
import { HOME_MOCK } from '../data/homeMock';

// `location` is absent in live mode: the backend has no location/ETA content.
export type HomeData = {
  isNewUser: boolean;
  location?: { pincode: string; area: string; eta: string };
};

// Lets tests/demos force a failed load.
export const mockHomeControls = { fail: false };

export const homeService = {
  // TODO(api): backend gap, no home content / location / ETA endpoint. Live
  // mode returns no location rather than showing mock text as real.
  // MOCK: replace with API (home content / profile / location).
  async get(): Promise<HomeData> {
    if (!mocksEnabled) return { isNewUser: false };
    await new Promise<void>(resolve => setTimeout(resolve, 400));
    if (mockHomeControls.fail) throw new Error('Home failed to load');
    return HOME_MOCK;
  },
};
