import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CartProvider } from './src/features/cart/context/CartContext';
import { AuthProvider } from './src/features/auth/context/AuthContext';
import { SessionExpiredModal } from './src/features/auth/components/SessionExpiredModal';
import { CheckoutProvider } from './src/features/checkout/context/CheckoutContext';
import { AppErrorBoundary } from './src/components/common/AppErrorBoundary';
import { AppShell } from './src/components/common/AppShell';
import { startConnectivityMonitoring } from './src/services/network/connectivity';
import { StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Expo Go cannot link native font assets, so register the brand fonts at runtime.
const fonts = {
  'DMSans-Regular': require('./src/assets/fonts/DMSans-Regular.ttf'),
  'DMSans-Medium': require('./src/assets/fonts/DMSans-Medium.ttf'),
  'DMSans-SemiBold': require('./src/assets/fonts/DMSans-SemiBold.ttf'),
  'DMSans-Bold': require('./src/assets/fonts/DMSans-Bold.ttf'),
  'InstrumentSerif-Regular': require('./src/assets/fonts/InstrumentSerif-Regular.ttf'),
  'InstrumentSerif-Italic': require('./src/assets/fonts/InstrumentSerif-Italic.ttf'),
  'JetBrainsMono-Regular': require('./src/assets/fonts/JetBrainsMono-Regular.ttf'),
  'JetBrainsMono-Medium': require('./src/assets/fonts/JetBrainsMono-Medium.ttf'),
};

const queryClient = new QueryClient();

const App = () => {
  const [fontsLoaded, fontError] = useFonts(fonts);
  useEffect(() => startConnectivityMonitoring(), []);
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);
  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <AuthProvider>
              <CartProvider>
                <CheckoutProvider>
                  <AppShell>
                    <RootNavigator />
                  </AppShell>
                  <SessionExpiredModal />
                </CheckoutProvider>
              </CartProvider>
            </AuthProvider>
          </NavigationContainer>
        </QueryClientProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
