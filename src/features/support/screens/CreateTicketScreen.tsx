import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { Chip } from '../../../components/common/Chip';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { TextField } from '../../../components/common/TextField';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
import { useOrders } from '../../orders/hooks/useOrders';
import { AttachmentPicker } from '../components/AttachmentPicker';
import { supportError } from '../errorMessage';
import { useCreateTicket } from '../hooks/useSupport';
import { CATEGORIES, type PickedFile } from '../types';
import { validateTicket } from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTicket'>;

export const CreateTicketScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const orders = useOrders();
  const create = useCreateTicket();
  const submitting = useRef(false);
  const [category, setCategory] = useState('');
  const [orderId, setOrderId] = useState<string | undefined>(
    route.params?.orderId,
  );
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<PickedFile>();
  const [errors, setErrors] = useState<ReturnType<typeof validateTicket>>({});
  const [serverError, setServerError] = useState<string>();

  const submit = async () => {
    if (submitting.current) return;
    const found = validateTicket({ category, subject, description });
    setErrors(found);
    setServerError(undefined);
    if (Object.keys(found).length) return;
    submitting.current = true;
    try {
      const ticket = await create.mutateAsync({
        category,
        orderId,
        subject,
        description,
        file,
      });
      navigation.replace('TicketDetails', { ticketId: ticket.id });
    } catch (e) {
      setServerError(supportError(e, 'ticket'));
    } finally {
      submitting.current = false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="New ticket" onBack={navigation.goBack} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>1 · WHAT’S IT ABOUT?</Text>
        <View style={styles.chips}>
          {CATEGORIES.map(item => (
            <Chip
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </View>
        {errors.category ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {errors.category}
          </Text>
        ) : null}

        {orders.data?.length ? (
          <>
            <Text style={styles.label}>2 · WHICH ORDER? (OPTIONAL)</Text>
            <View style={styles.chips}>
              <Chip
                label="None"
                selected={!orderId}
                onPress={() => setOrderId(undefined)}
              />
              {orders.data.map(order => (
                <Chip
                  key={order.id}
                  label={order.id}
                  selected={orderId === order.id}
                  onPress={() => setOrderId(order.id)}
                />
              ))}
            </View>
          </>
        ) : null}

        <TextField
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          maxLength={100}
          error={errors.subject}
          returnKeyType="next"
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          maxLength={2000}
          multiline
          textAlignVertical="top"
          style={styles.multiline}
          error={errors.description}
        />
        <AttachmentPicker
          file={file}
          onChange={setFile}
          disabled={create.isPending}
        />
        {serverError ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {serverError}
          </Text>
        ) : null}
        <Button
          variant="dark"
          label="Submit ticket"
          onPress={submit}
          loading={create.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, paddingHorizontal: spacing.xl },
  label: {
    ...typography.tag,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    paddingTop: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  multiline: { minHeight: 120, paddingTop: 12 },
  error: { ...typography.bodySmall, color: colors.danger },
});
