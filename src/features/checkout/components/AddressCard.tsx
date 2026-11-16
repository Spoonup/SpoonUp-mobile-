import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../../theme';
import type { Address } from '../types';

type Props = {
  address: Address;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

// Mockup 6i card: label, address line, Edit / Delete text actions. In picker
// mode a radio ring shows the selection.
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
      {onPress ? (
        <View style={[styles.ring, selected && styles.ringOn]}>
          {selected ? <View style={styles.ringDot} /> : null}
        </View>
      ) : null}
      <View style={styles.flex}>
        <Text style={styles.name}>{address.name}</Text>
        <Text style={styles.line}>
          {address.line1}, {address.city}
        </Text>
        <Text style={styles.zone}>
          {address.pincode}
          {address.phone ? ` · +91 ${address.phone}` : ''}
        </Text>
      </View>
    </Pressable>
    {onEdit || onDelete ? (
      <View style={styles.actions}>
        {onEdit ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit address for ${address.name}`}
            onPress={onEdit}
            style={styles.action}
          >
            <Text style={styles.edit}>Edit</Text>
          </Pressable>
        ) : null}
        {onDelete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete address for ${address.name}`}
            onPress={onDelete}
            style={styles.action}
          >
            <Text style={styles.del}>Delete</Text>
          </Pressable>
        ) : null}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  selected: { borderColor: colors.olive },
  flex: { flex: 1, gap: 3 },
  body: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    paddingBottom: 6,
    minHeight: 48,
  },
  ring: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  ringOn: { borderColor: colors.olive },
  ringDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.olive,
  },
  name: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  line: {
    fontFamily: fontFamily.sans,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(27,42,24,0.75)',
  },
  zone: {
    fontFamily: fontFamily.sans,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
  action: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    paddingRight: 8,
  },
  edit: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11.5,
    color: colors.olive,
  },
  del: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11.5,
    color: colors.textMuted,
  },
});
