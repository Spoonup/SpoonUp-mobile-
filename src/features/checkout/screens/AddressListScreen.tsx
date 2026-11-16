import { useRefresh } from '../../../hooks/useRefresh';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../../components/common/Icon';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, fontFamily, spacing } from '../../../theme';
import { AddressCard } from '../components/AddressCard';
import { useCheckout } from '../context/CheckoutContext';
import { useAddresses, useDeleteAddress } from '../hooks/useAddresses';

type Props = NativeStackScreenProps<RootStackParamList, 'Addresses'>;

// Doubles as the checkout picker (select) and Account > Addresses (manage).
export const AddressListScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const select = route.params?.select ?? false;
  const checkout = useCheckout();
  const { data, isLoading, isError, refetch } = useAddresses();
  const pull = useRefresh(refetch);
  const remove = useDeleteAddress();
  const confirmDelete = (id: string) =>
    Alert.alert('Delete this address?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove.mutate(id),
      },
    ]);
  const addNew = () => navigation.navigate('AddressForm');
  const AddTile = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add a new address"
      onPress={addNew}
      style={styles.add}
    >
      <View style={styles.plus}>
        <Icon name="plus" color={colors.onDark} size={18} strokeWidth={2} />
      </View>
      <Text style={styles.addText}>Add a new address</Text>
    </Pressable>
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <Skeleton height={76} />
          <Skeleton height={76} />
        </View>
      );
    }
    if (isError || !data) return <ErrorState onRetry={refetch} />;
    if (data.length === 0) {
      return (
        <EmptyState
          title="No saved addresses"
          message="Add a delivery address to check out faster."
          actionLabel="Add address"
          onAction={addNew}
        />
      );
    }
    return (
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={AddTile}
        {...pull}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            selected={select && item.id === checkout.addressId}
            onPress={
              select
                ? () => {
                    checkout.setAddressId(item.id);
                    navigation.goBack();
                  }
                : undefined
            }
            onEdit={() =>
              navigation.navigate('AddressForm', { addressId: item.id })
            }
            onDelete={select ? undefined : () => confirmDelete(item.id)}
          />
        )}
      />
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={select ? 'Choose address' : 'Addresses'}
        onBack={navigation.goBack}
      />
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { gap: spacing.md, padding: spacing.xl },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(74,93,46,0.45)',
    borderRadius: 14,
    backgroundColor: 'rgba(74,93,46,0.04)',
    marginBottom: spacing.md,
  },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
});
