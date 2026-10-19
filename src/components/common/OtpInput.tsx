import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, typography } from '../../theme';

type Props = {
  value: string;
  length?: number;
  onChange: (value: string) => void;
  hasError?: boolean;
};

export const OtpInput = ({ value, length = 6, onChange, hasError }: Props) => {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable
      accessibilityRole="none"
      onPress={() => inputRef.current?.focus()}
      style={styles.row}
    >
      {Array.from({ length }, (_, i) => {
        const digit = value[i] ?? '';
        const isActive = i === activeIndex;
        const borderColor = hasError
          ? colors.danger
          : isActive
          ? colors.ink
          : digit
          ? 'rgba(27, 42, 24, 0.3)'
          : 'rgba(27, 42, 24, 0.12)';
        return (
          <View key={i} style={[styles.box, { borderColor }]}>
            <Text style={styles.digit}>{digit}</Text>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={text =>
          onChange(text.replace(/\D/g, '').slice(0, length))
        }
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        maxLength={length}
        accessibilityLabel="Verification code"
        style={styles.hidden}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radius.md + 3,
    borderWidth: 1.5,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: { ...typography.title, fontSize: 24, color: colors.ink },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
