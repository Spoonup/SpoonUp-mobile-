import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { useBlockBack } from '../../../hooks/useBlockBack';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatPlanDate } from '../logic';
import { usePlan } from '../hooks/usePlan';

type Props = NativeStackScreenProps<RootStackParamList, 'PlanSuccess'>;

export const PlanSuccessScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { data } = usePlan();
  useBlockBack(true);
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 12 },
      ]}
    >
      <View style={styles.body}>
        <Text accessibilityRole="header" style={styles.title}>
          Your plan is active
        </Text>
        <Text style={styles.message}>
          Payment verified. Thank you for choosing SpoonUp.
        </Text>
        <View style={styles.card}>
          <Text style={styles.line}>
            Payment reference: {route.params.paymentReference}
          </Text>
          {data?.expiresAt ? (
            <Text style={styles.line}>
              Active until {formatPlanDate(data.expiresAt)}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          label="View my plan"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Plans' } }],
            })
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: spacing.xxl,
  },
  title: { ...typography.title, color: colors.ink, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 4,
    marginTop: spacing.md,
  },
  line: { ...typography.bodySmall, color: colors.ink },
  actions: { paddingHorizontal: spacing.xl },
});
