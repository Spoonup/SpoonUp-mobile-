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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => startConnectivityMonitoring(), []);
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
