import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { BellIcon, Icon } from '../../../components/common/Icon';
import { colors } from '../../../theme';
import { fontFamily } from '../../../theme/typography';

type Props = {
  initials: string;
  // Real unread count only; 0 hides the badge.
  unread: number;
  onOpenNotifications: () => void;
  onOpenAccount: () => void;
  // Home scroll offset; drives the frosted backdrop + hairline.
  scrollY: Animated.Value;
  topInset: number;
};

const ROW = 48;
const PAD_TOP = 8;
const PAD_BOTTOM = 8;
export const homeHeaderHeight = (topInset: number) =>
  topInset + PAD_TOP + ROW + PAD_BOTTOM;

// Approved app design (6b): logo left; bell with count badge + avatar right.
// Sticky: blends with the cream surface at rest, frosted once scrolled.
export const HomeHeader = ({
  initials,
  unread,
  onOpenNotifications,
  onOpenAccount,
  scrollY,
  topInset,
}: Props) => (
  <View style={styles.bar}>
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.backdrop,
        {
          opacity: scrollY.interpolate({
            inputRange: [0, 24],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
        },
      ]}
    >
      {/* Android blur (experimentalBlurMethod) is still experimental:
          translucent cream there instead. */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      ) : null}
    </Animated.View>
    <View style={[styles.inner, { paddingTop: topInset + PAD_TOP }]}>
      <Image
        source={require('../../../assets/images/spoonup-logo.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="SpoonUp"
      />
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
              <Text style={styles.badgeText}>
                {unread > 99 ? '99+' : unread}
              </Text>
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
            <Icon
              name="chevronDown"
              color={colors.ink}
              size={10}
              strokeWidth={2}
            />
          </View>
        </Pressable>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  // Padding lives here so the absolute backdrop covers the status-bar area.
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: PAD_BOTTOM,
  },
  backdrop: {
    backgroundColor:
      Platform.OS === 'ios'
        ? 'rgba(252, 251, 247, 0.6)'
        : 'rgba(252, 251, 247, 0.92)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  // Wordmark is 1639x960.
  logo: { height: 32, width: 55 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
