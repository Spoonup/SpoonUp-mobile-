import { useState } from 'react';
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
import { useKeyboardVisible } from '../../../hooks/useKeyboardVisible';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { TextField } from '../../../components/common/TextField';
import { useOffline } from '../../../hooks/useOffline';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
import { useCheckout } from '../context/CheckoutContext';
import { friendlyError } from '../errorMessage';
import { useAddresses, useSaveAddress } from '../hooks/useAddresses';
import type { AddressInput } from '../types';
import { validateAddress, type AddressErrors } from '../validation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddressForm'>;

const EMPTY: AddressInput = {
  name: '',
  phone: '',
  line1: '',
  pincode: '',
  city: '',
};

export const AddressFormScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  const offline = useOffline();
  const { setAddressId } = useCheckout();
  const addressId = route.params?.addressId;
  const existing = useAddresses().data?.find(item => item.id === addressId);
  const [values, setValues] = useState<AddressInput>(
    existing
      ? {
          name: existing.name,
          phone: existing.phone,
          line1: existing.line1,
          pincode: existing.pincode,
          city: existing.city,
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<AddressErrors>({});
  const save = useSaveAddress();

  const bind = (field: keyof AddressInput) => ({
    value: values[field],
    error: errors[field],
    onChangeText: (text: string) => {
      setValues(prev => ({ ...prev, [field]: text }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    },
  });

  const submit = () => {
    const found = validateAddress(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    save.mutate(
      { input: values, id: addressId },
      {
        onSuccess: saved => {
          setAddressId(saved.id);
          navigation.goBack();
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={addressId ? 'Edit address' : 'New address'}
          onBack={navigation.goBack}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextField label="Full name" autoComplete="name" {...bind('name')} />
        <TextField
          label="Mobile number"
          keyboardType="number-pad"
          maxLength={10}
          autoComplete="tel"
          {...bind('phone')}
        />
        <TextField
          label="House, street, area"
          autoComplete="street-address"
          {...bind('line1')}
        />
        <TextField
          label="Pincode"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="postal-code"
          {...bind('pincode')}
        />
        <TextField label="City" {...bind('city')} />
        {save.isError ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {friendlyError(save.error, 'Couldn’t save the address. Try again.')}
          </Text>
        ) : null}
      </ScrollView>
      <View
        style={[
          styles.footer,
          { paddingBottom: (keyboardVisible ? 0 : insets.bottom) + 12 },
        ]}
      >
        <Button
          label="Save address"
          onPress={submit}
          loading={save.isPending}
          disabled={offline}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.lg, padding: spacing.xl },
  error: { ...typography.bodySmall, color: colors.danger },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
