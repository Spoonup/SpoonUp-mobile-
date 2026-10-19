import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../theme';

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <View style={styles.card}>
    <Text accessibilityRole="header" style={styles.title}>
      {title}
    </Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  title: { ...typography.heading, color: colors.ink },
});
