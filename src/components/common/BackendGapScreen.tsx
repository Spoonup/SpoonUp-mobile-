import { Linking, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import { EmptyState } from './EmptyState';
import { ScreenHeader } from './ScreenHeader';

export const SUPPORT_EMAIL = 'support@spoonupfoods.com';

// Shown in live mode where the SpoonUp backend has no endpoint yet (support
// tickets, notifications). The mock screens stay available in mock mode only,
// so fake data never appears as real.
// TODO(api): backend gap. Replace with the real screen once the endpoint exists.
export const BackendGapScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList>) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Not in the app yet" onBack={navigation.goBack} />
      <EmptyState
        title="Not available in the app yet"
        message={`For help with an order, a payment or your plan, email ${SUPPORT_EMAIL} and we’ll get back to you.`}
        actionLabel="Email support"
        onAction={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
});
