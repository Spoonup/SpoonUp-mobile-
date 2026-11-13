import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../../components/common/Button';
import { Chip } from '../../../components/common/Chip';
import { ErrorState } from '../../../components/common/ErrorState';
import { Skeleton } from '../../../components/common/Skeleton';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatRupees } from '../../../utils/money';
import { useProducts } from '../../shop/hooks/useProducts';
import { frequencyLabel } from '../logic';
import { planService } from '../services/planService';

type Props = { onStart: (productId: string, frequency: string) => void };

// Live plan purchase, as on the website: pick a dish and how often. The
// backend prices it (fixed 30-day pass); the app only shows the quote.
export const PlanBuilder = ({ onStart }: Props) => {
  const products = useProducts();
  const options = useQuery({
    queryKey: ['plan-options'],
    queryFn: planService.getOptions,
  });
  const [chosenProduct, setProduct] = useState<string>();
  const [chosenFrequency, setFrequency] = useState<string>();

  const choices = (products.data ?? []).filter(p => p.canSubscribe);
  const frequencies = options.data?.frequencies ?? [];
  const productId = chosenProduct ?? choices[0]?.id;
  const frequency = chosenFrequency ?? frequencies[1] ?? frequencies[0];

  const quote = useQuery({
    queryKey: ['plan-quote', productId, frequency],
    queryFn: () => planService.quote(productId as string, frequency as string),
    enabled: !!productId && !!frequency,
  });

  if (products.isError || options.isError) {
    return (
      <ErrorState
        message="We couldn’t load plans. Check your connection and try again."
        onRetry={() => {
          products.refetch();
          options.refetch();
        }}
      />
    );
  }
  if (products.isLoading || options.isLoading) {
    return <Skeleton height={220} borderRadius={radius.lg} />;
  }
  if (choices.length === 0 || frequencies.length === 0) {
    return (
      <Text style={styles.note}>
        Nothing is set up for a plan right now. Check back soon.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>SCHEDULE PLAN</Text>
      <Text style={styles.lead}>
        Pick a dish and how often you want it. Pay once for the whole{' '}
        {options.data?.validityDays}-day plan. It never renews on its own.
      </Text>
      <Text style={styles.label}>Dish</Text>
      <View style={styles.chips}>
        {choices.map(p => (
          <Chip
            key={p.id}
            label={p.name}
            selected={p.id === productId}
            onPress={() => setProduct(p.id)}
          />
        ))}
      </View>
      <Text style={styles.label}>How often</Text>
      <View style={styles.chips}>
        {frequencies.map(id => (
          <Chip
            key={id}
            label={frequencyLabel(id)}
            selected={id === frequency}
            onPress={() => setFrequency(id)}
          />
        ))}
      </View>
      <View style={styles.summary}>
        {quote.isError ? (
          <ErrorState
            message="We couldn’t price this plan."
            onRetry={() => quote.refetch()}
          />
        ) : quote.data ? (
          <>
            <Text style={styles.note}>
              {quote.data.deliveryCount} deliveries over{' '}
              {quote.data.validityDays} days
            </Text>
            <View style={styles.totalRow}>
              <Text style={styles.cardTitle}>Plan price</Text>
              <Text style={styles.total}>{formatRupees(quote.data.total)}</Text>
            </View>
            <Text style={styles.note}>
              Includes GST. Your plan starts only after we verify your payment.
            </Text>
          </>
        ) : (
          <Skeleton height={80} />
        )}
      </View>
      <Button
        label={
          quote.data
            ? `Start plan · ${formatRupees(quote.data.total)}`
            : 'Start plan'
        }
        disabled={!quote.data}
        onPress={() => onStart(productId as string, frequency as string)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  kicker: { ...typography.kicker, color: colors.tanDark },
  lead: { ...typography.bodyLarge, color: colors.textSecondary },
  label: { ...typography.label, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summary: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    padding: 20,
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardTitle: { ...typography.heading, color: colors.ink },
  total: { ...typography.amount, color: colors.ink },
  note: { ...typography.bodySmall, color: colors.textSecondary },
});
