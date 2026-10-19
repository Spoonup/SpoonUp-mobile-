import type { NavigatorScreenParams } from '@react-navigation/native';

export type ShopCategory = 'all' | 'now' | 'plan' | 'ships';

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
        resetPhone?: boolean;
      }
    | undefined;
  HelpSignIn: { phone: string };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Cart: undefined;
  Checkout: undefined;
  ProductDetails: { productId: string };
  OrderDetails: { orderId: string };
  OrderTracking: { orderId: string };
  GuestTracking: undefined;
  Notifications: undefined;
  Profile: undefined;
  Addresses: { select?: boolean } | undefined;
  AddressForm: { addressId?: string } | undefined;
  Payment: undefined;
  PaymentVerify: { orderId: string };
  PaymentFailed: undefined;
  PaymentCancelled: undefined;
  OrderConfirmation: { orderId: string; paymentReference: string };
  PlanPayment: undefined;
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
