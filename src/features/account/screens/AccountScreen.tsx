import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import {
  CommonActions,
  type CompositeScreenProps,
} from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../../navigation/types';
import { colors, fontFamily, typography } from '../../../theme';
import { useAuth } from '../../auth/context/AuthContext';
import { useCart } from '../../cart/context/CartContext';
import { initialsOf, livePlan } from '../../home/logic';
import { useAddresses } from '../../checkout/hooks/useAddresses';
import { formatMoney } from '../../../utils/money';
import { useOrders } from '../../orders/hooks/useOrders';
import { ReferralCard } from '../../credit/components/ReferralCard';
import { useCreditStatement } from '../../credit/hooks/useCredit';
import { planService } from '../../plan/services/planService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Account'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Row = { label: string; meta?: string; onPress: () => void };

const Group = ({ items }: { items: Row[] }) => (
  <View style={styles.card}>
    {items.map((row, index) => (
      <Pressable
        key={row.label}
        accessibilityRole="button"
        accessibilityLabel={row.label}
        onPress={row.onPress}
        style={[styles.row, index > 0 && styles.rowBorder]}
      >
        <Text style={styles.rowLabel}>{row.label}</Text>
        <View style={styles.rowRight}>
          {row.meta ? <Text style={styles.rowMeta}>{row.meta}</Text> : null}
          <Icon name="chevronRight" color={colors.textMuted} size={16} />
        </View>
      </Pressable>
    ))}
  </View>
);

// Mockup 6h. DECISION (backend gaps, rendered only if data exists):
// member-since, delivery-alerts toggle, payment methods and Terms row have no
// customer endpoint, so they are omitted. Credit tile and referral card come
// from /api/me/store-credit and /api/me/referrals.
// TODO(api): push opt-in.
export const AccountScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, signOut } = useAuth();
  const cart = useCart();
  const queryClient = useQueryClient();
  const orders = useOrders(isAuthenticated);
  const addresses = useAddresses(isAuthenticated);
  const credit = useCreditStatement(isAuthenticated);
  const rows = useQuery({
    queryKey: ['plan-rows', isAuthenticated],
    queryFn: planService.getPlanRows,
    enabled: isAuthenticated,
  });

  const logout = async () => {
    await signOut();
    cart.clear();
    queryClient.clear();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
    );
  };

  const plansLive = (rows.data ?? []).filter(
    r =>
      (r.status === 'ACTIVE' || r.status === 'PAUSED') &&
      livePlan([r]) !== undefined,
  );
  const paused = plansLive.filter(r => r.status === 'PAUSED').length;
  const orderCount = orders.data?.length;
  const count = (n: number | undefined, one: string) =>
    n === undefined ? undefined : n === 0 ? 'None' : `${n} ${one}`;

  const list: Row[] = [
    {
      label: 'Orders',
      meta: orderCount === undefined ? undefined : String(orderCount),
      onPress: () => navigation.navigate('Orders'),
    },
    {
      label: 'My plans',
      meta: rows.data
        ? plansLive.length
          ? `${plansLive.length} active`
          : 'None'
        : undefined,
      onPress: () => navigation.navigate('Plans'),
    },
    {
      label: 'Addresses',
      meta: count(addresses.data?.length, 'saved'),
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      label: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Text accessibilityRole="header" style={styles.title}>
        Account
      </Text>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user ? initialsOf(user.name) : 'G'}
            </Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={1}>
              {user ? user.name : 'Guest'}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {user
                ? [user.phone && `+91 ${user.phone}`, user.email]
                    .filter(Boolean)
                    .join(' · ')
                : 'Log in to see your orders'}
            </Text>
          </View>
          {user ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              onPress={() => navigation.navigate('Profile')}
              style={styles.edit}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          ) : null}
        </View>

        {isAuthenticated ? (
          <>
            <View style={styles.stats}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="SpoonUp credit"
                onPress={() => navigation.navigate('Credit')}
                style={styles.stat}
              >
                <Text style={styles.statLabel}>Credit</Text>
                <Text style={styles.statValue}>
                  {credit.data ? formatMoney(credit.data.available) : '–'}
                </Text>
              </Pressable>
              <View style={[styles.stat, styles.statBorder]}>
                <Text style={styles.statLabel}>Active plans</Text>
                <Text style={styles.statValue}>
                  {rows.data
                    ? `${plansLive.length}${
                        paused ? ` · ${paused} paused` : ''
                      }`
                    : '–'}
                </Text>
              </View>
              <View style={[styles.stat, styles.statBorder]}>
                <Text style={styles.statLabel}>Orders</Text>
                <Text style={styles.statValue}>{orderCount ?? '–'}</Text>
              </View>
            </View>
            <ReferralCard />
            <Group items={list} />
            <Group
              items={[
                {
                  label: 'Help & support',
                  onPress: () => navigation.navigate('Support'),
                },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={logout}
              style={styles.logout}
            >
              <Text style={styles.logoutText}>Sign out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Button
              variant="dark"
              label="Log in or sign up"
              onPress={() => navigation.navigate('Auth')}
            />
            <Button
              variant="outline"
              label="Track an order"
              onPress={() => navigation.navigate('GuestTracking')}
            />
          </>
        )}
        <Text style={styles.version}>
          SpoonUp v{Constants.expoConfig?.version ?? ''}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  title: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 15,
    color: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  content: { gap: 16, padding: 20, paddingTop: 18 },
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
  sub: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  edit: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    color: colors.olive,
  },
  stats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  stat: { flex: 1, padding: 12, gap: 2, backgroundColor: colors.surfaceMuted },
  statBorder: { borderLeftWidth: 1, borderLeftColor: colors.divider },
  statLabel: {
    fontFamily: fontFamily.sans,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  statValue: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 15,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowLabel: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowMeta: {
    fontFamily: fontFamily.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  logout: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  logoutText: { ...typography.button, fontSize: 13, color: colors.danger },
  version: {
    textAlign: 'center',
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    color: colors.textDisabled,
  },
});
