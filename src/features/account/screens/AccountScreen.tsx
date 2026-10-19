import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CommonActions,
  type CompositeScreenProps,
} from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../../navigation/types';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';
import { useAuth } from '../../auth/context/AuthContext';
import { useCart } from '../../cart/context/CartContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

const ROWS = [
  { label: 'Profile', route: 'Profile' },
  { label: 'Addresses', route: 'Addresses' },
  { label: 'Notifications', route: 'Notifications' },
  { label: 'Support', route: 'Support' },
] as const;

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

export const AccountScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, signOut } = useAuth();
  const cart = useCart();
  const queryClient = useQueryClient();

  const logout = async () => {
    await signOut();
    cart.clear();
    queryClient.clear();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text accessibilityRole="header" style={styles.title}>
        Account
      </Text>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user ? initialsOf(user.name) : '?'}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>{user ? user.name : 'Guest'}</Text>
            <Text style={styles.phone}>
              {user ? `+91 ${user.phone}` : 'Log in to see your orders'}
            </Text>
          </View>
        </View>

        {isAuthenticated ? (
          <>
            <View style={styles.card}>
              {ROWS.map((row, index) => (
                <Pressable
                  key={row.route}
                  accessibilityRole="button"
                  accessibilityLabel={row.label}
                  onPress={() => navigation.navigate(row.route)}
                  style={[styles.row, index > 0 && styles.rowBorder]}
                >
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={logout}
              style={styles.logout}
            >
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          </>
        ) : (
          <Button
            label="Log in or sign up"
            onPress={() => navigation.navigate('Auth')}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  title: {
    ...typography.title,
    color: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  content: { gap: spacing.lg, padding: spacing.xl },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 20,
    color: colors.onDark,
  },
  name: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    lineHeight: 29,
    color: colors.ink,
  },
  phone: { ...typography.bodySmall, color: colors.textSecondary },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowLabel: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  chevron: { fontSize: 18, color: colors.textMuted },
  logout: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  logoutText: { ...typography.button, fontSize: 13, color: colors.danger },
});
