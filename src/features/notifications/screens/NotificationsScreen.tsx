import { useRefresh } from '../../../hooks/useRefresh';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { useAuth } from '../../auth/context/AuthContext';
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from '../hooks/useNotifications';
import { groupNotifications, routeFor, unreadCount } from '../logic';
import type { AppNotification } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export const NotificationsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useNotifications(isAuthenticated);
  const pull = useRefresh(refetch);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const unread = unreadCount(data);

  const open = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    const target = routeFor(n);
    if (!target) return;
    if (target.name === 'Plans') {
      navigation.navigate('MainTabs', { screen: 'Plans' });
    } else if (target.name === 'OrderDetails') {
      navigation.navigate('OrderDetails', target.params);
    } else {
      navigation.navigate('TicketDetails', target.params);
    }
  };

  const renderBody = () => {
    if (!isAuthenticated) {
      return (
        <EmptyState
          title="Sign in for notifications"
          message="Order and support updates show up here once you’re signed in."
          actionLabel="Log in or sign up"
          onAction={() => navigation.navigate('Auth')}
        />
      );
    }
    if (isLoading) {
      return (
        <View style={styles.list}>
          <Skeleton height={72} borderRadius={radius.lg} />
          <Skeleton height={72} borderRadius={radius.lg} />
        </View>
      );
    }
    if (error) return <ErrorState onRetry={refetch} />;
    return (
      <SectionList
        sections={groupNotifications(data ?? []).map(g => ({
          title: g.title,
          data: g.items,
        }))}
        keyExtractor={n => n.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        {...pull}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            title="No notifications yet"
            message="Updates about your orders and tickets will appear here."
          />
        }
        renderSectionHeader={({ section }) => (
          <Text accessibilityRole="header" style={styles.section}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.read ? '' : 'Unread. '}${item.title}. ${
              item.body
            }`}
            onPress={() => open(item)}
            style={[styles.item, !item.read && styles.itemUnread]}
          >
            {!item.read ? (
              <View style={styles.dot} />
            ) : (
              <View style={styles.dotGap} />
            )}
            <View style={styles.text}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </Pressable>
        )}
      />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Notifications"
        onBack={navigation.goBack}
        right={
          isAuthenticated && unread > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
              onPress={() => markAll.mutate()}
              style={styles.markAll}
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />
      <View style={styles.flex}>{renderBody()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  list: { flexGrow: 1, gap: spacing.sm, paddingHorizontal: spacing.xl },
  section: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  itemUnread: { backgroundColor: colors.surfaceMuted },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.terracotta,
  },
  dotGap: { width: 8 },
  text: { flex: 1, gap: 2 },
  title: { ...typography.label, color: colors.ink },
  body: { ...typography.bodySmall, color: colors.textSecondary },
  markAll: { minHeight: 44, justifyContent: 'center' },
  markAllText: { ...typography.label, color: colors.olive },
});
