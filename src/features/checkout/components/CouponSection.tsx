import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../../components/common/Icon';
import { Button } from '../../../components/common/Button';
import { TextField } from '../../../components/common/TextField';
import { colors, radius, typography } from '../../../theme';
import { friendlyError } from '../errorMessage';
import { useApplyCoupon } from '../hooks/useCheckoutDraft';

type Props = {
  appliedCode: string | null;
  onApplied: (code: string | null) => void;
};

// Mockup 6d "Apply a coupon" row; expands to a code field. Validity is the
// backend's (POST /api/coupons/validate).
export const CouponSection = ({ appliedCode, onApplied }: Props) => {
  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);
  const apply = useApplyCoupon();

  const submit = () => {
    if (!code.trim()) return;
    apply.mutate(code, {
      onSuccess: result => {
        onApplied(result.code);
        setCode('');
        setOpen(false);
      },
    });
  };

  const title = appliedCode ? `${appliedCode} applied` : 'Apply a coupon';
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          appliedCode ? `Remove coupon ${appliedCode}` : title
        }
        onPress={() => {
          if (appliedCode) {
            apply.reset();
            onApplied(null);
          } else {
            setOpen(value => !value);
          }
        }}
        style={styles.head}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>%</Text>
        </View>
        <View style={styles.headText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>
            {appliedCode ? 'Tap to remove' : 'Enter a code'}
          </Text>
        </View>
        {appliedCode ? null : (
          <Icon
            name={open ? 'chevronUp' : 'chevronRight'}
            color={colors.textMuted}
            size={18}
          />
        )}
      </Pressable>
      {open && !appliedCode ? (
        <View style={styles.form}>
          <TextField
            label="Coupon code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
            error={
              apply.isError
                ? friendlyError(
                    apply.error,
                    'Couldn’t check that coupon. Try again.',
                  )
                : undefined
            }
          />
          <Button
            variant="outline"
            label="Apply coupon"
            onPress={submit}
            loading={apply.isPending}
            disabled={!code.trim()}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.white,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    padding: 14,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  badgeText: { ...typography.heading, color: colors.ink },
  headText: { flex: 1, gap: 2 },
  title: { ...typography.heading, color: colors.ink },
  sub: { ...typography.labelSmall, color: colors.textSecondary },
  form: { gap: 10, padding: 14, paddingTop: 0 },
});
