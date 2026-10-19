import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_SEEN_KEY = 'spoonup.onboardingSeen';

export const appStorage = {
  async hasSeenOnboarding(): Promise<boolean> {
    return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === 'true';
  },
  async markOnboardingSeen(): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  },
};
