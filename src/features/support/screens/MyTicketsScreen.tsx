import { useRefresh } from '../../../hooks/useRefresh';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../../components/common/Icon';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import { useAuth } from '../../auth/context/AuthContext';
import { StatusChip } from '../components/StatusChip';
import { useTickets } from '../hooks/useSupport';
import { formatWhen } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Support'>;

export const MyTicketsScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useTickets(isAuthenticated);
  const pull = useRefresh(refetch);

  const body = () => {
    if (!isAuthenticated) {
      return (
        <EmptyState
          title="Sign in for support"
          message="Log in to view or raise a support ticket."
          actionLabel="Log in or sign up"
          onAction={() => navigation.navigate('Auth', { returnTo: 'Support' })}
        />
      );
    }
    if (isLoading) {
      return (
        <View style={styles.list}>
          <Skeleton height={84} borderRadius={12} />
          <Skeleton height={84} borderRadius={12} />
        </View>
      );
    }
    if (error) return <ErrorState onRetry={refetch} />;
    return (
      <FlatList
        data={data}
        keyExtractor={ticket => ticket.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        {...pull}
        ListEmptyComponent={
          <EmptyState
            title="No tickets yet"
            message="Need help with an order? Raise a ticket and we’ll get back to you."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ticket ${item.subject}, ${item.status}`}
            onPress={() =>
              navigation.navigate('TicketDetails', { ticketId: item.id })
            }
            style={styles.card}
          >
            <View style={styles.row}>
              <Text style={styles.cat} numberOfLines={1}>
                {item.category}
              </Text>
              <StatusChip status={item.status} />
            </View>
            <Text style={styles.subject} numberOfLines={2}>
              {item.subject}
            </Text>
            <Text style={styles.meta}>
              Updated {formatWhen(item.updatedAt)}
            </Text>
          </Pressable>
        )}
      />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Help & support" onBack={navigation.goBack} />
      {/* FLAG: the website has email-only support (support@spoonupfoods.com)
          and no ticket system. Tickets are kept as built (CLAUDE.md). */}
      {isAuthenticated ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Raise a new ticket"
          onPress={() => navigation.navigate('CreateTicket')}
          style={styles.hero}
        >
          <View style={styles.flex}>
            <Text style={styles.heroTitle}>Something not right?</Text>
            <Text style={styles.heroSub}>
              Raise a ticket and follow the replies here. Prefer email? Write to
              support@spoonupfoods.com.
            </Text>
          </View>
          <View style={styles.plus}>
            <Icon name="plus" color={colors.ink} size={20} strokeWidth={2} />
          </View>
        </Pressable>
      ) : null}
      <View style={styles.flex}>{body()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: spacing.xl,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.ink,
  },
  heroTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 22,
    lineHeight: 25,
    color: colors.onDark,
  },
  heroSub: {
    ...typography.bodySmall,
    color: 'rgba(252,251,247,0.7)',
    marginTop: 4,
  },
  plus: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 1,
    gap: 10,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  card: {
    minHeight: 72,
    gap: 6,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cat: {
    flex: 1,
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  subject: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: colors.ink,
  },
  meta: {
    fontFamily: fontFamily.sans,
    fontSize: 11.5,
    color: colors.textMuted,
  },
});
