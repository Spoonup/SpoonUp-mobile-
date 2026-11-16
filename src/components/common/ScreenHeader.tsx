import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Icon } from './Icon';

type Props = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export const ScreenHeader = ({ title, onBack, right }: Props) => (
  <View style={styles.row}>
    <View style={styles.left}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={4}
          style={styles.back}
        >
          <Icon name="back" color={colors.ink} size={20} />
        </Pressable>
      ) : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.headline,
    fontSize: 28,
    lineHeight: 30,
    color: colors.ink,
    flexShrink: 1,
  },
});
