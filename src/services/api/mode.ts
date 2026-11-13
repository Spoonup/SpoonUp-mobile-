import { appConfig } from '../../config/appConfig';

// True when services should use their in-app mock instead of the backend.
export const mocksEnabled = appConfig.env.useMocks;
