import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Skeleton } from '../../../components/common/Skeleton';
import { colors, radius, typography } from '../../../theme';
import type { DeliveryOption } from '../types';
import { Section } from './Section';

type Props = {
  options?: DeliveryOption[];
  selectedId?: string;
  isLoading: boolean;
  isError: boolean;
  needsAddress: boolean;
  onSelect: (id: string) => void;
  onRetry: () => void;
};

export const DeliverySection = ({
  options,
  selectedId,
  isLoading,
  isError,
  needsAddress,
  onSelect,
  onRetry,
}: Props) => {
  const renderBody = () => {
    if (needsAddress) {
      return <Text style={styles.note}>Add an address to see delivery.</Text>;
    }
    if (isError) {
      return (
        <Button
          variant="outline"
          label="Retry delivery options"
          onPress={onRetry}
        />
      );
    }
    if (isLoading) return <Skeleton height={56} />;
    if (!options?.length) {
      return (
        <Text style={styles.note}>
          Nothing in your cart can be delivered right now.
        </Text>
      );
    }
    return options.map(option => {
      const selected = option.id === selectedId;
      return (
        <Pressable
          key={option.id}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          accessibilityLabel={`${option.label}, ${option.detail}`}
          onPress={() => onSelect(option.id)}
          style={[styles.option, selected && styles.selected]}
        >
          <Text style={styles.label}>{option.label}</Text>
          <Text style={styles.note}>{option.detail}</Text>
        </Pressable>
      );
    });
  };

  return (
    <Section step={3} title="When should the kitchen order arrive?">
      <View style={styles.list}>{renderBody()}</View>
    </Section>
  );
};

const styles = StyleSheet.create({
  list: { gap: 8 },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    gap: 2,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  selected: {
    borderColor: colors.olive,
    borderWidth: 2,
    backgroundColor: colors.selectedBg,
  },
  label: { ...typography.label, color: colors.ink },
  note: { ...typography.bodySmall, color: colors.textSecondary },
});
