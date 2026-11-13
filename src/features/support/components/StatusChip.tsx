import { StyleSheet, Text, View } from 'react-native';
import { typography } from '../../../theme';
import { STATUS_UI, type TicketStatus } from '../types';

export const StatusChip = ({ status }: { status: TicketStatus }) => {
  const ui = STATUS_UI[status];
  return (
    <View
      accessible
      accessibilityLabel={`Status: ${ui.label}`}
      style={[styles.chip, { backgroundColor: ui.bg }]}
    >
      <Text style={[styles.label, { color: ui.color }]}>
        {ui.label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  label: { ...typography.tag },
});
