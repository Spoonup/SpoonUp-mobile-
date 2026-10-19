import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import type { Address } from '../types';

type Props = {
  address: Address;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export const AddressCard = ({
  address,
  selected,
  onPress,
  onEdit,
  onDelete,
}: Props) => (
  <View style={[styles.card, selected && styles.selected]}>
    <Pressable
      accessibilityRole={onPress ? 'radio' : 'text'}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      accessibilityLabel={`${address.name}, ${address.line1}, ${address.city} ${address.pincode}`}
      disabled={!onPress}
      onPress={onPress}
      style={styles.body}
    >
      <Text style={styles.name}>{address.name}</Text>
      <Text style={styles.text}>
        {address.line1}, {address.city} {address.pincode}
      </Text>
      <Text style={styles.text}>+91 {address.phone}</Text>
    </Pressable>
    {onEdit ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit address for ${address.name}`}
        onPress={onEdit}
        style={styles.edit}
      >
        <Text style={styles.editText}>Edit</Text>
      </Pressable>
    ) : null}
    {onDelete ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete address for ${address.name}`}
        onPress={onDelete}
        style={styles.edit}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  selected: { borderColor: colors.ink, borderWidth: 2 },
  body: { flex: 1, gap: 2, padding: 14, minHeight: 48 },
  name: { ...typography.heading, color: colors.ink },
  text: { ...typography.bodySmall, color: colors.textSecondary },
  edit: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  deleteText: { ...typography.label, color: colors.danger },
  editText: { ...typography.label, color: colors.olive },
});
