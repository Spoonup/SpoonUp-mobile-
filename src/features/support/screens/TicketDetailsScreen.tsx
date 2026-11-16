import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { useKeyboardVisible } from '../../../hooks/useKeyboardVisible';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import { TextField } from '../../../components/common/TextField';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, spacing, typography } from '../../../theme';
import { AttachmentLink } from '../components/AttachmentLink';
import { AttachmentPicker } from '../components/AttachmentPicker';
import { StatusChip } from '../components/StatusChip';
import { supportError } from '../errorMessage';
import { useReply, useTicket } from '../hooks/useSupport';
import { canReply, formatWhen, type PickedFile } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetails'>;

export const TicketDetailsScreen = ({ navigation, route }: Props) => {
  const { ticketId } = route.params;
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const bottomInset = keyboardVisible ? 0 : insets.bottom;
  const { data, isLoading, error, refetch } = useTicket(ticketId);
  const reply = useReply(ticketId);
  const sending = useRef(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState<PickedFile>();
  const [problem, setProblem] = useState<string>();

  const send = async () => {
    if (sending.current) return;
    if (!text.trim()) {
      setProblem('Please write a message.');
      return;
    }
    sending.current = true;
    setProblem(undefined);
    try {
      await reply.mutateAsync({ body: text, file });
      setText('');
      setFile(undefined);
    } catch (e) {
      setProblem(supportError(e, 'reply'));
    } finally {
      sending.current = false;
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.pad}>
          <Skeleton height={80} borderRadius={12} />
        </View>
      );
    }
    if (error || !data) return <ErrorState onRetry={refetch} />;
    return (
      <>
        <View style={styles.head}>
          <Text style={styles.subject}>{data.subject}</Text>
          <Text style={styles.headMeta}>
            {data.category} · Updated {formatWhen(data.updatedAt)}
          </Text>
        </View>
        <FlatList
          data={data.messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.thread}
          refreshing={false}
          onRefresh={refetch}
          renderItem={({ item }) => {
            const mine = item.from === 'customer';
            return (
              <View
                accessible
                accessibilityLabel={`${mine ? 'You' : 'SpoonUp support'}: ${
                  item.body
                }`}
                style={[styles.bubble, mine ? styles.mine : styles.theirs]}
              >
                <Text style={[styles.who, mine && styles.whoMine]}>
                  {mine ? 'You' : 'SpoonUp support'} ·{' '}
                  {formatWhen(item.createdAt)}
                </Text>
                <Text style={[styles.msg, mine && styles.msgMine]}>
                  {item.body}
                </Text>
                {item.attachment ? (
                  <AttachmentLink attachment={item.attachment} />
                ) : null}
              </View>
            );
          }}
        />
        {canReply(data.status) ? (
          <View style={styles.composer}>
            <TextField
              label="Reply"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={2000}
              textAlignVertical="top"
              error={problem}
            />
            <AttachmentPicker
              file={file}
              onChange={setFile}
              disabled={reply.isPending}
            />
            <Button
              variant="dark"
              label="Send reply"
              onPress={send}
              loading={reply.isPending}
            />
          </View>
        ) : (
          <Text style={styles.closed}>
            This ticket is closed. Start a new ticket if you still need help.
          </Text>
        )}
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
          paddingBottom: bottomInset,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader
        title={data ? `#${data.id}` : 'Ticket'}
        onBack={navigation.goBack}
        right={data ? <StatusChip status={data.status} /> : undefined}
      />
      {renderBody()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  pad: { padding: spacing.xl },
  head: {
    gap: 2,
    marginHorizontal: spacing.xl,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  subject: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  headMeta: {
    fontFamily: fontFamily.sans,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  thread: { gap: spacing.md, padding: spacing.xl },
  bubble: { maxWidth: '84%', padding: 12, borderRadius: 14 },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.ink,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    backgroundColor: colors.surfaceMuted,
  },
  who: { ...typography.labelSmall, color: colors.textMuted },
  whoMine: { color: colors.sage },
  msg: { ...typography.body, color: colors.ink, marginTop: 4 },
  msgMine: { color: colors.onDark },
  composer: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  closed: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
