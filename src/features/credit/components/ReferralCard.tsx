import { Share, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, typography } from '../../../theme';
import { Button } from '../../../components/common/Button';
import { formatMoney } from '../../../utils/money';
import { firstOrderClause, rewardCopy, shareMessage } from '../logic';
import { useReferral } from '../hooks/useCredit';

// Refer & earn card (mockup 6h). Everything comes from GET /api/me/referrals;
// hidden when the programme is off, there is no code, or the request fails.
export const ReferralCard = () => {
  const { data } = useReferral(true);
  if (!data?.rule.enabled || !data.code) return null;
  const { code, rule, joined, earned } = data;
  const share = () => {
    Share.share({ message: shareMessage(code, rule) }).catch(() => {});
  };
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>
        REFER & EARN · {joined} {joined === 1 ? 'FRIEND' : 'FRIENDS'} JOINED
      </Text>
      <Text style={styles.copy}>{rewardCopy(rule)}</Text>
      <Text accessibilityLabel={`Your referral code ${code}`} style={styles.code}>
        {code}
      </Text>
      <Button
        label="Share your code"
        accessibilityLabel="Share your referral code"
        onPress={share}
        variant="sage"
      />
      <Text style={styles.foot}>
        Rewards are SpoonUp credit, added {firstOrderClause(rule)}.
        {earned > 0 ? ` You have earned ${formatMoney(earned)}.` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 18,
    borderRadius: radius.card,
    backgroundColor: colors.ink,
  },
  kicker: { ...typography.kicker, fontSize: 10.5, color: colors.sage },
  copy: { ...typography.body, color: colors.onDarkMuted },
  code: {
    fontFamily: fontFamily.mono,
    fontSize: 22,
    letterSpacing: 2,
    color: colors.onDark,
  },
  foot: { ...typography.bodySmall, color: colors.onDarkMuted },
});
