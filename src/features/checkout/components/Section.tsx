import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../../theme';

// Numbered site-style section: tan number, serif title, no card chrome.
export const Section = ({
  title,
  step,
  children,
}: {
  title: string;
  step?: number;
  children: ReactNode;
}) => (
  <View style={styles.wrap}>
    <View style={styles.head}>
      {step ? <Text style={styles.step}>{step}</Text> : null}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  step: { ...typography.kicker, color: colors.tan },
  title: { ...typography.titleCard, color: colors.ink, flexShrink: 1 },
});
