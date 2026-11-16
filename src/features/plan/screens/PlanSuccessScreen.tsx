import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { Icon } from '../../../components/common/Icon';
import { useBlockBack } from '../../../hooks/useBlockBack';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../theme';
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
        <View style={styles.mark}>
          <Icon
            name="check"
            color={colors.onDark}
            size={34}
            strokeWidth={1.8}
          />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          Your plan is active
        </Text>
        <Text style={styles.message}>
          Payment verified. Thank you for choosing SpoonUp.
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.key}>Payment reference</Text>
            <Text style={styles.val}>{route.params.paymentReference}</Text>
          </View>
          {data?.expiresAt ? (
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.key}>Active until</Text>
              <Text style={styles.val}>{formatPlanDate(data.expiresAt)}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.note}>
          Ends on its own after 30 days. Nothing renews or is charged again.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label="Go to My plans"
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
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.olive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  key: { ...typography.bodySmall, color: colors.textSecondary },
  val: {
    ...typography.label,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  note: {
    ...typography.labelSmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: { paddingHorizontal: spacing.xl },
});
