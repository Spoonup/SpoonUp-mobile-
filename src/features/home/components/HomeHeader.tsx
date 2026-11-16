import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BellIcon, Icon } from '../../../components/common/Icon';
import { colors } from '../../../theme';
import { fontFamily } from '../../../theme/typography';

type Props = {
  initials: string;
  // Real unread count only; 0 hides the badge.
  unread: number;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
};

// Approved app design (6b): bell with count badge + avatar, right-aligned.
export const HomeHeader = ({
  initials,
  unread,
  onOpenNotifications,
  onOpenAccount,
}: Props) => (
  <View style={styles.row}>
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
          <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Account"
      onPress={onOpenAccount}
      hitSlop={4}
      style={styles.avatarRing}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.chevron}>
        <Icon name="chevronDown" color={colors.ink} size={10} strokeWidth={2} />
      </View>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
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
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10.5,
    lineHeight: 13,
    color: colors.onDark,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    color: colors.onDark,
  },
  chevron: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
