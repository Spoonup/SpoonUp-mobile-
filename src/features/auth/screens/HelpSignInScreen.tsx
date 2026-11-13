import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSignIn'>;

const SUPPORT_EMAIL = 'support@spoonupfoods.com';

// The backend has no password-reset endpoint, so, like the website, this
// screen points to email support instead of offering a reset flow.
export const HelpSignInScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Get in touch" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>TROUBLE SIGNING IN</Text>
        <Text style={styles.text}>
          Forgotten your password or username? Email us from the address on your
          account and we will help you get back in.
        </Text>
        <Button
          label={`Email ${SUPPORT_EMAIL}`}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        />
        <Text style={styles.text}>
          Meanwhile you can keep browsing as a guest and track an order with its
          tracking reference.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.lg, padding: spacing.xl },
  kicker: { ...typography.kicker, color: colors.tanDark },
  text: { ...typography.bodyLarge, color: colors.textSecondary },
});
