import type { NavigatorScreenParams } from '@react-navigation/native';

export type ShopCategory = 'all' | 'now' | 'plan';

export type MainTabParamList = {
  Home: undefined;
  Shop: { category?: ShopCategory } | undefined;
  Orders: undefined;
  Plans: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth:
    | {
        returnTo?: 'Checkout' | 'Support' | 'PlanPayment';
      }
    | undefined;
  HelpSignIn: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Cart: undefined;
  Checkout: undefined;
  ProductDetails: { productId: string };
  OrderDetails: { orderId: string };
  OrderTracking: { orderId: string };
  GuestTracking: undefined;
  Notifications: undefined;
  Profile: undefined;
  Credit: undefined;
  Addresses: { select?: boolean } | undefined;
  AddressForm: { addressId?: string } | undefined;
  RazorpayCheckout: undefined;
  PaymentVerify: { orderId: string };
  // amount/reference/reason are display hints from the backend intent.
  PaymentFailed:
    | { amount?: number; reference?: string; reason?: string }
    | undefined;
  PaymentCancelled: { amount?: number } | undefined;
  OrderConfirmation: { orderId: string; paymentReference: string };
  // Live: the plan (dish + delivery frequency) chosen on the Plans tab.
  // Build a 30-day plan (mockup 6f2); productId preselects the dish.
  NewPlan: { productId?: string } | undefined;
  PlanPayment: { productId?: string; frequency?: string } | undefined;
  PlanVerify: { planOrderId: string };
  PlanSuccess: { paymentReference: string };
  PlanFailed: undefined;
  PlanCancelled: undefined;
  Support: undefined;
  CreateTicket: { orderId?: string } | undefined;
  TicketDetails: { ticketId: string };
  AttachmentPreview: {
    attachmentId: string;
    name: string;
    mimeType: string;
    size: number;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
