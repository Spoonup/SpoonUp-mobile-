import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../features/onboarding/screens/OnboardingScreen';
import { SplashScreen } from '../features/onboarding/screens/SplashScreen';
import { AuthScreen } from '../features/auth/screens/AuthScreen';
import { CreditScreen } from '../features/credit/screens/CreditScreen';
import { ProfileScreen } from '../features/account/screens/ProfileScreen';
import { AttachmentPreviewScreen } from '../features/support/screens/AttachmentPreviewScreen';
import { CreateTicketScreen } from '../features/support/screens/CreateTicketScreen';
import { MyTicketsScreen } from '../features/support/screens/MyTicketsScreen';
import { TicketDetailsScreen } from '../features/support/screens/TicketDetailsScreen';
import { CartScreen } from '../features/cart/screens/CartScreen';
import { AddressFormScreen } from '../features/checkout/screens/AddressFormScreen';
import { AddressListScreen } from '../features/checkout/screens/AddressListScreen';
import { CheckoutScreen } from '../features/checkout/screens/CheckoutScreen';
import { OrderConfirmationScreen } from '../features/checkout/screens/OrderConfirmationScreen';
import {
  PaymentCancelledScreen,
  PaymentFailedScreen,
} from '../features/checkout/screens/PaymentOutcomeScreens';
import { PaymentVerifyScreen } from '../features/checkout/screens/PaymentVerifyScreen';
import { OrderDetailsScreen } from '../features/orders/screens/OrderDetailsScreen';
import { GuestTrackingScreen } from '../features/orders/screens/GuestTrackingScreen';
import { OrderTrackingScreen } from '../features/orders/screens/OrderTrackingScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { ProductDetailsScreen } from '../features/shop/screens/ProductDetailsScreen';
import { HelpSignInScreen } from '../features/auth/screens/HelpSignInScreen';
import { NewPlanScreen } from '../features/plan/screens/NewPlanScreen';
import { PlanPaymentScreen } from '../features/plan/screens/PlanPaymentScreen';
import {
  PlanCancelledScreen,
  PlanFailedScreen,
} from '../features/plan/screens/PlanOutcomeScreens';
import { PlanSuccessScreen } from '../features/plan/screens/PlanSuccessScreen';
import { PlanVerifyScreen } from '../features/plan/screens/PlanVerifyScreen';
import { RazorpayCheckoutScreen } from '../features/payments/RazorpayCheckoutScreen';
import { BackendGapScreen } from '../components/common/BackendGapScreen';
import { mocksEnabled } from '../services/api/mode';
import { colors } from '../theme';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => (
  <Stack.Navigator
    initialRouteName="Splash"
    screenOptions={{
      headerShown: false,
      // Cream behind every screen so no window colour shows through.
      contentStyle: { backgroundColor: colors.surface },
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Auth" component={AuthScreen} />
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    <Stack.Screen name="GuestTracking" component={GuestTrackingScreen} />
    {/* TODO(api): backend gap: no notifications or support endpoints. In live
        mode these show an honest "email support" state, not mock data. */}
    <Stack.Screen
      name="Notifications"
      component={mocksEnabled ? NotificationsScreen : BackendGapScreen}
    />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Credit" component={CreditScreen} />
    <Stack.Screen name="Addresses" component={AddressListScreen} />
    <Stack.Screen name="AddressForm" component={AddressFormScreen} />
    <Stack.Screen
      name="RazorpayCheckout"
      component={RazorpayCheckoutScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="PaymentVerify"
      component={PaymentVerifyScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="PaymentFailed"
      component={PaymentFailedScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="PaymentCancelled"
      component={PaymentCancelledScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="OrderConfirmation"
      component={OrderConfirmationScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen name="HelpSignIn" component={HelpSignInScreen} />
    <Stack.Screen name="NewPlan" component={NewPlanScreen} />
    <Stack.Screen name="PlanPayment" component={PlanPaymentScreen} />
    <Stack.Screen
      name="PlanVerify"
      component={PlanVerifyScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="PlanSuccess"
      component={PlanSuccessScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="PlanFailed"
      component={PlanFailedScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="PlanCancelled"
      component={PlanCancelledScreen}
      options={{ gestureEnabled: false }}
    />
    <Stack.Screen
      name="Support"
      component={mocksEnabled ? MyTicketsScreen : BackendGapScreen}
    />
    <Stack.Screen
      name="CreateTicket"
      component={mocksEnabled ? CreateTicketScreen : BackendGapScreen}
    />
    <Stack.Screen
      name="TicketDetails"
      component={mocksEnabled ? TicketDetailsScreen : BackendGapScreen}
    />
    <Stack.Screen
      name="AttachmentPreview"
      component={mocksEnabled ? AttachmentPreviewScreen : BackendGapScreen}
    />
  </Stack.Navigator>
);
