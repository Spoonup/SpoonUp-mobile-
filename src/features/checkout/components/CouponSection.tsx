import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { TextField } from '../../../components/common/TextField';
import { colors, typography } from '../../../theme';
import { friendlyError } from '../errorMessage';
import { useApplyCoupon } from '../hooks/useCheckoutDraft';
import { Section } from './Section';

type Props = {
  appliedCode: string | null;
  onApplied: (code: string | null) => void;
};

export const CouponSection = ({ appliedCode, onApplied }: Props) => {
  const [code, setCode] = useState('');
  const apply = useApplyCoupon();

  const submit = () => {
    if (!code.trim()) return;
    apply.mutate(code, {
      onSuccess: result => {
        onApplied(result.code);
        setCode('');
      },
    });
  };

  if (appliedCode) {
    return (
      <Section step={4} title="Coupon">
        <View style={styles.applied}>
          <Text style={styles.code}>{appliedCode} applied</Text>
          <Button
            variant="outline"
            label="Remove"
            accessibilityLabel={`Remove coupon ${appliedCode}`}
            onPress={() => {
              apply.reset();
              onApplied(null);
            }}
          />
        </View>
      </Section>
    );
  }

  return (
    <Section step={4} title="Coupon">
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
    </Section>
  );
};

const styles = StyleSheet.create({
  applied: { gap: 10 },
  code: { ...typography.heading, color: colors.olive },
});
