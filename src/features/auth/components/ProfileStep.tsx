import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { TextField } from '../../../components/common/TextField';
import {
  colors,
  fontFamily,
  radius,
  spacing,
  typography,
} from '../../../theme';

type PincodeInfo = { area: string; eta: string } | undefined;

type Props = {
  name: string;
  onNameChange: (value: string) => void;
  pincode: string;
  onPincodeChange: (value: string) => void;
  pincodeInfo: PincodeInfo;
  pincodeComplete: boolean;
  referralCode: string;
  onReferralChange: (value: string) => void;
  showReferral: boolean;
  onOpenReferral: () => void;
  valid: boolean;
  busy: boolean;
  error: string | null;
  onSubmit: () => void;
};

export const ProfileStep = ({
  name,
  onNameChange,
  pincode,
  onPincodeChange,
  pincodeInfo,
  pincodeComplete,
  referralCode,
  onReferralChange,
  showReferral,
  onOpenReferral,
  valid,
  busy,
  error,
  onSubmit,
}: Props) => {
  const hint = !name.trim()
    ? 'Add your name to continue'
    : !pincodeComplete
    ? 'Enter your 6-digit pincode to continue'
    : 'All set';

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>ALMOST THERE</Text>
      <Text style={styles.headline}>What reaches you?</Text>
      <Text style={styles.sub}>
        Just your pincode for now. We’ll ask for flat and street at checkout.
      </Text>

      <TextField
        label="Your name"
        value={name}
        onChangeText={onNameChange}
        placeholder="First name is fine"
        autoComplete="name"
        textContentType="givenName"
      />
      <TextField
        label="Delivery pincode"
        value={pincode}
        onChangeText={onPincodeChange}
        placeholder="560102"
        keyboardType="number-pad"
        textContentType="postalCode"
        maxLength={6}
      />

      {pincodeComplete ? (
        <View
          style={[
            styles.notice,
            pincodeInfo ? styles.noticeOk : styles.noticeWarn,
          ]}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: pincodeInfo ? colors.olive : colors.tan },
            ]}
          />
          <Text
            style={[
              styles.noticeText,
              { color: pincodeInfo ? colors.olive : colors.tan },
            ]}
          >
            {pincodeInfo
              ? `${pincode} · eat-now in ${pincodeInfo.area}, plus plans and pantry`
              : 'Our kitchen doesn’t reach here yet, but pantry orders still ship to you in 3–5 days.'}
          </Text>
        </View>
      ) : null}

      {showReferral ? (
        <TextField
          label="Referral code"
          value={referralCode}
          onChangeText={onReferralChange}
          placeholder="e.g. MEHER150"
          autoCapitalize="characters"
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenReferral}
          hitSlop={8}
        >
          <Text style={styles.link}>+ I have a referral code</Text>
        </Pressable>
      )}

      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.hint}>{hint}</Text>
        <Button
          label="Start eating"
          onPress={onSubmit}
          disabled={!valid}
          loading={busy}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: spacing.md, paddingTop: spacing.lg },
  kicker: { ...typography.kicker, color: colors.tan },
  headline: {
    fontFamily: fontFamily.serif,
    fontSize: 34,
    lineHeight: 37,
    color: colors.ink,
  },
  sub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: -4 },
  notice: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 11,
    borderRadius: radius.md + 1,
  },
  noticeOk: { backgroundColor: colors.tagNowBg },
  noticeWarn: { backgroundColor: colors.tagShipsBg },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  noticeText: { ...typography.label, flex: 1, lineHeight: 18 },
  link: { ...typography.label, color: colors.olive },
  error: { ...typography.bodySmall, color: colors.danger },
  footer: { marginTop: 'auto', gap: 9, paddingBottom: spacing.lg },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
