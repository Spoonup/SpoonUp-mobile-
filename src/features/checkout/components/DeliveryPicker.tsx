import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Skeleton } from '../../../components/common/Skeleton';
import { colors, radius, typography } from '../../../theme';
import type { DeliveryOption } from '../types';

type Props = {
  options?: DeliveryOption[];
  selectedId?: string;
  isLoading: boolean;
  isError: boolean;
  onSelect: (id: string) => void;
  onRetry: () => void;
};

// Mockup 6d: Immediate / Scheduled tiles, then day chips and a 2-column slot
// grid. Every option (days, slot labels) is backend data from /schedule/slots.
export const DeliveryPicker = ({
  options,
  selectedId,
  isLoading,
  isError,
  onSelect,
  onRetry,
}: Props) => {
  if (isError) {
    return (
      <Button
        variant="outline"
        label="Retry delivery options"
        onPress={onRetry}
      />
    );
  }
  if (isLoading) return <Skeleton height={72} />;
  if (!options?.length) {
    return (
      <Text style={styles.note}>
        Nothing in your cart can be delivered right now.
      </Text>
    );
  }

  const immediate = options.find(option => option.kind === 'immediate');
  const slots = options.filter(option => option.kind === 'scheduled');
  const selected = options.find(option => option.id === selectedId);
  const scheduledMode = selected?.kind === 'scheduled';
  const days = [...new Set(slots.map(slot => slot.dayLabel ?? slot.label))];
  const day = scheduledMode ? selected?.dayLabel : days[0];
  const daySlots = slots.filter(slot => (slot.dayLabel ?? slot.label) === day);

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>DELIVERY TYPE</Text>
      <View style={styles.row}>
        <Tile
          title="Immediate"
          sub={immediate ? 'Made fresh' : 'Not available'}
          selected={!scheduledMode}
          disabled={!immediate}
          onPress={() => immediate && onSelect(immediate.id)}
        />
        <Tile
          title="Scheduled"
          sub="Pick a day and slot"
          selected={scheduledMode}
          disabled={slots.length === 0}
          onPress={() => slots[0] && onSelect(slots[0].id)}
        />
      </View>
      {scheduledMode ? (
        <>
          <View style={styles.row}>
            {days.map(label => (
              <Cell
                key={label}
                title={label}
                selected={label === day}
                onPress={() => {
                  const first = slots.find(
                    slot => (slot.dayLabel ?? slot.label) === label,
                  );
                  if (first) onSelect(first.id);
                }}
              />
            ))}
          </View>
          <View style={styles.grid}>
            {daySlots.map(slot => (
              <Cell
                key={slot.id}
                title={slot.slotLabel ?? slot.label}
                selected={slot.id === selectedId}
                half
                onPress={() => onSelect(slot.id)}
              />
            ))}
            {daySlots.length % 2 === 1 ? (
              <View style={[styles.half, styles.spacer]} />
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
};

const Tile = ({
  title,
  sub,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  sub: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="radio"
    accessibilityState={{ selected, disabled: !!disabled }}
    accessibilityLabel={`${title}, ${sub}`}
    disabled={disabled}
    onPress={onPress}
    style={[
      styles.tile,
      selected && styles.tileOn,
      disabled && styles.disabled,
    ]}
  >
    <Text style={styles.tileTitle}>{title}</Text>
    <Text style={styles.note}>{sub}</Text>
  </Pressable>
);

// Day chip / slot cell: dark fill when selected, as in the mockup.
const Cell = ({
  title,
  selected,
  half,
  onPress,
}: {
  title: string;
  selected: boolean;
  half?: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    accessibilityLabel={title}
    onPress={onPress}
    style={[styles.cell, half && styles.half, selected && styles.cellOn]}
  >
    <Text
      style={[styles.cellText, selected && styles.cellTextOn]}
      numberOfLines={2}
    >
      {title}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  wrap: { gap: 10, padding: 14 },
  kicker: { ...typography.kicker, fontSize: 11, color: colors.textMuted },
  row: { flexDirection: 'row', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    flex: 1,
    minHeight: 56,
    gap: 2,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  tileOn: {
    borderColor: colors.olive,
    borderWidth: 2,
    backgroundColor: colors.surfaceMuted,
  },
  disabled: { opacity: 0.45 },
  tileTitle: { ...typography.heading, color: colors.ink },
  note: { ...typography.labelSmall, color: colors.textSecondary },
  cell: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  // Two per row in the slot grid.
  half: { flexBasis: '45%' },
  spacer: { flex: 1 },
  cellOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  cellText: { ...typography.label, color: colors.ink, textAlign: 'center' },
  cellTextOn: { color: colors.onDark },
});
