import * as Keychain from 'react-native-keychain';

const SERVICE = 'spoonup.auth';

export const secureTokenStore = {
  async getToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    return credentials ? credentials.password : null;
  },
  async setToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('session', token, { service: SERVICE });
  },
  async clearToken(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};
