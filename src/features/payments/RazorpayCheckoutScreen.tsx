import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import {
  buildCheckoutHtml,
  parseWebViewMessage,
  settleRazorpay,
  takeRazorpayRequest,
  type RazorpayResult,
} from './razorpay';

type Props = NativeStackScreenProps<RootStackParamList, 'RazorpayCheckout'>;

// Hosts Razorpay Checkout. Whatever it reports (or closing the screen) only
// settles the pending promise; the caller then asks the backend to verify.
export const RazorpayCheckoutScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const req = useMemo(() => takeRazorpayRequest(), []);
  const done = useRef(false);

  const finish = (result: RazorpayResult) => {
    if (done.current) return;
    done.current = true;
    settleRazorpay(result);
    navigation.goBack();
  };

  // Back button / swipe = cancelled.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        if (done.current) return;
        done.current = true;
        settleRazorpay({ kind: 'cancelled' });
      }),
    [navigation],
  );

  const html = useMemo(() => (req ? buildCheckoutHtml(req) : ''), [req]);

  if (!req) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ScreenHeader title="Payment" onBack={navigation.goBack} />
        <EmptyState
          title="No payment in progress"
          message="Go back and start the payment again."
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Secure payment" onBack={navigation.goBack} />
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://checkout.razorpay.com' }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.ink} />
          </View>
        )}
        onMessage={event => finish(parseWebViewMessage(event.nativeEvent.data))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
