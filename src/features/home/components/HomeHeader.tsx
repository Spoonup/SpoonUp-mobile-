import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BellIcon } from '../../../components/common/Icon';
import { colors, radius, spacing, typography } from '../../../theme';

type Props = {
  area: string;
  pincode: string;
  eta: string;
  initials: string;
  unread: number;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
};

export const HomeHeader = ({
  area,
  pincode,
  eta,
  initials,
  unread,
  onOpenNotifications,
  onOpenAccount,
}: Props) => (
  <View style={styles.row}>
    <View style={styles.location} accessibilityRole="text">
      <View style={styles.locationDot} />
      <Text style={styles.locationText} numberOfLines={1}>
        {area} {pincode} · {eta} ▾
      </Text>
    </View>
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'
        }
        onPress={onOpenNotifications}
        hitSlop={8}
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
        hitSlop={8}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 1,
  },
  locationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.olive,
  },
  locationText: { ...typography.label, color: colors.ink, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderStrong,
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
