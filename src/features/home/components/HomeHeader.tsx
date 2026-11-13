import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BellIcon, CartIcon } from '../../../components/common/Icon';
import { colors, radius, spacing, typography } from '../../../theme';

type Props = {
  location?: { area: string; pincode: string; eta: string };
  initials: string;
  unread: number;
  cartCount: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
};

export const HomeHeader = ({
  location,
  initials,
  unread,
  cartCount,
  onOpenCart,
  onOpenNotifications,
  onOpenAccount,
}: Props) => (
  <View style={styles.wrap}>
    <View style={styles.row}>
      <Image
        source={require('../../../assets/images/spoonup-logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="SpoonUp"
      />
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'
          }
          onPress={onOpenCart}
          hitSlop={4}
          style={styles.cartPill}
        >
          <CartIcon color={colors.onDark} size={16} />
          <Text style={styles.cartText}>Cart</Text>
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
          }
          onPress={onOpenNotifications}
          hitSlop={4}
          style={styles.bell}
        >
          <BellIcon color={colors.ink} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account"
          onPress={onOpenAccount}
          hitSlop={4}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </Pressable>
      </View>
    </View>
    {location ? (
      <View style={styles.location} accessibilityRole="text">
        <View style={styles.locationDot} />
        <Text style={styles.locationText} numberOfLines={1}>
          {location.area} {location.pincode} · {location.eta} ▾
        </Text>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  logo: { height: 32, width: 110 },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.olive,
  },
  locationText: { ...typography.label, color: colors.ink, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  cartText: { ...typography.button, color: colors.onDark },
  cartBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { ...typography.labelSmall, color: colors.ink },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.onDark,
    fontSize: 10,
    lineHeight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.label, color: colors.onDark, fontSize: 13 },
});
