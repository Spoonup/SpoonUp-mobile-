import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { daysLeftLabel, formatPlanDate } from '../../plan/logic';
import type { Plan } from '../../plan/types';

type Props = { plan: Plan; onPress: () => void };

// One card for all three plan states; all values come from planService.
export const PlanCard = ({ plan, onPress }: Props) => {
  if (plan.status === 'active') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`30-day plan active, ${daysLeftLabel(
          plan.daysLeft,
        )}`}
        onPress={onPress}
        style={[styles.card, styles.dark]}
      >
        <View style={styles.flex}>
          <Text style={[styles.kicker, { color: colors.sage }]}>
            30-DAY PLAN · ACTIVE
          </Text>
          <Text style={[styles.darkTitle]}>{daysLeftLabel(plan.daysLeft)}</Text>
          <Text style={styles.darkSub}>
            Ends {plan.expiresAt ? formatPlanDate(plan.expiresAt) : ''}
          </Text>
        </View>
        <Text style={styles.darkCta}>View →</Text>
      </Pressable>
    );
  }
  const expired = plan.status === 'expired';
  return (
    <View style={styles.card}>
      {expired ? null : (
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/lifestyle/week-jars.jpg')}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>
      )}
      <View style={styles.body}>
        <Text style={[styles.kicker, { color: colors.ink }]}>
          30-DAY PLAN · PAID ONCE
        </Text>
        <Text style={styles.title}>
          {expired ? 'Your plan has ended' : 'Start a 30-day plan'}
        </Text>
        <Text style={styles.sub}>
          {formatRupees(plan.offer.price)} one-time ·{' '}
          {expired ? 'Renewing is a new purchase.' : 'Starts after payment.'}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>
            {expired ? 'Renew plan' : 'View plan'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  dark: {
    backgroundColor: colors.ink,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  darkTitle: { ...typography.label, fontSize: 18, color: colors.onDark },
  darkSub: { ...typography.bodySmall, fontSize: 12, color: colors.onDarkMuted },
  darkCta: { ...typography.labelSmall, color: colors.sage },
  hero: { height: 120 },
  image: { width: '100%', height: '100%' },
  body: { padding: 15, gap: 5 },
  kicker: { ...typography.kicker, fontSize: 10 },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: 23,
    lineHeight: 25,
    color: colors.ink,
  },
  sub: {
    ...typography.bodySmall,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  ctaText: { ...typography.labelSmall, color: colors.onDark, fontSize: 12.5 },
});
