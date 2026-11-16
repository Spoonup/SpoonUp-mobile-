import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fontFamily, typography } from '../../theme';
import { Icon, type IconName } from './Icon';
import { ScreenHeader } from './ScreenHeader';

export const SUPPORT_EMAIL = 'support@spoonupfoods.com';

const COPY: Partial<
  Record<
    keyof RootStackParamList,
    { title: string; icon: IconName; head: string; body: string }
  >
> = {
  Notifications: {
    title: 'Notifications',
    icon: 'bell',
    head: 'No notifications here yet',
    body: 'We’ll text and email you about your orders and plans. In-app updates are coming.',
  },
};
const FALLBACK = {
  title: 'Help & support',
  icon: 'help' as IconName,
  head: 'Something not right?',
  body: `Email us about an order, a payment or your plan and we’ll get back to you. In-app tickets are coming.`,
};

// Shown in live mode where the SpoonUp backend has no endpoint yet (support
// tickets, notifications). The mock screens stay available in mock mode only,
// so fake data never appears as real.
// TODO(api): backend gap. Replace with the real screen once the endpoint exists.
export const BackendGapScreen = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList>) => {
  const insets = useSafeAreaInsets();
  const copy = COPY[route.name as keyof RootStackParamList] ?? FALLBACK;
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title={copy.title} onBack={navigation.goBack} />
      <View style={styles.body}>
        <View style={styles.badge}>
          <Icon name={copy.icon} color={colors.olive} size={26} />
        </View>
        <Text style={styles.head}>{copy.head}</Text>
        <Text style={styles.text}>{copy.body}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Email support"
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          style={styles.mail}
        >
          <Icon name="doc" color={colors.ink} size={18} />
          <View>
            <Text style={styles.mailTitle}>Email support</Text>
            <Text style={styles.mailSub}>{SUPPORT_EMAIL}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
    textAlign: 'center',
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 270,
  },
  mail: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  mailTitle: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 12.5,
    color: colors.ink,
  },
  mailSub: {
    fontFamily: fontFamily.sans,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
