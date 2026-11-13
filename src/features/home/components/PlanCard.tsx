import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { daysLeftLabel, formatPlanDate } from '../../plan/logic';
import type { Plan } from '../../plan/types';

type Props = { plan: Plan; onPress: () => void };

// Site dark plan banner. One card for all plan states; values come from planService.
export const PlanCard = ({ plan, onPress }: Props) => {
  const active = plan.status === 'active';
  const expired = plan.status === 'expired';
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>
        {active ? 'SCHEDULE PLAN · ACTIVE' : 'SCHEDULE PLAN · PAY ONCE'}
      </Text>
      <Text style={styles.title}>
        {active
          ? daysLeftLabel(plan.daysLeft)
          : expired
          ? 'Your plan has ended'
          : '30 days of deliveries, paid once'}
      </Text>
      <Text style={styles.sub}>
        {active
          ? `Ends ${plan.expiresAt ? formatPlanDate(plan.expiresAt) : ''}`
          : `${
              plan.offer.price > 0
                ? `${formatRupees(plan.offer.price)} one-time. `
                : ''
            }One prepaid payment, it does not renew.`}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          active
            ? '30-day plan, view'
            : expired
            ? 'Renew plan'
            : 'Build your plan'
        }
        onPress={onPress}
        style={styles.cta}
      >
        <Text style={styles.ctaText}>
          {active ? 'View plan' : expired ? 'Renew plan' : 'Build your plan'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.ink,
    padding: 24,
    gap: 8,
    alignItems: 'flex-start',
  },
  kicker: { ...typography.kicker, fontSize: 11, color: colors.sage },
  title: { ...typography.headline, color: colors.onDark },
  sub: { ...typography.body, color: colors.onDarkMuted },
  cta: {
    marginTop: 8,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.sage,
  },
  ctaText: { ...typography.button, color: colors.ink },
});
