import { useRefresh } from '../../../hooks/useRefresh';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
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
              <Text style={styles.subject} numberOfLines={2}>
                {item.subject}
              </Text>
              <StatusChip status={item.status} />
            </View>
            <Text style={styles.meta}>
              {item.category} · Updated {formatWhen(item.updatedAt)}
            </Text>
          </Pressable>
        )}
      />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader title="Support" onBack={navigation.goBack} />
      <View style={styles.flex}>{body()}</View>
      {isAuthenticated ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Button
            label="New ticket"
            onPress={() => navigation.navigate('CreateTicket')}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  list: { flexGrow: 1, gap: spacing.md, paddingHorizontal: spacing.xl },
  card: {
    minHeight: 72,
    gap: 6,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  subject: { ...typography.heading, flex: 1, color: colors.ink },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  footer: { paddingHorizontal: spacing.xl, paddingTop: 12 },
});
