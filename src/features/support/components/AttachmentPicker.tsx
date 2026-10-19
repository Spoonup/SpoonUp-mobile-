import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { colors, radius, spacing, typography } from '../../../theme';
import { ATTACHMENT_HINT, formatSize, validateAttachment } from '../attachment';
import { pickAttachment } from '../services/pickAttachment';
import type { PickedFile } from '../types';

type Props = {
  file?: PickedFile;
  onChange: (file?: PickedFile) => void;
  disabled?: boolean;
};

// Reusable for create-ticket and reply. Validation here is UX only.
export const AttachmentPicker = ({ file, onChange, disabled }: Props) => {
  const [error, setError] = useState<string>();

  const pick = async () => {
    setError(undefined);
    try {
      const picked = await pickAttachment();
      if (!picked) return;
      const problem = validateAttachment(picked);
      if (problem) setError(problem);
      else onChange(picked);
    } catch {
      setError('We couldn’t open your files. Check app permissions and retry.');
    }
  };

  return (
    <View style={styles.wrap}>
      {file ? (
        <View style={styles.file}>
          <Text style={styles.name} numberOfLines={1}>
            {file.name} · {formatSize(file.size)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove attachment ${file.name}`}
            onPress={() => onChange(undefined)}
            disabled={disabled}
            style={styles.remove}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Button
          variant="outline"
          label="Attach a photo or PDF"
          onPress={pick}
          disabled={disabled}
        />
      )}
      <Text style={styles.hint}>
        {/* MOCK: dev builds only; the picker returns a fixed fake file. */}
        {__DEV__ ? '[MOCK picker, dev only] ' : ''}
        {ATTACHMENT_HINT}
      </Text>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  file: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingLeft: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  name: { ...typography.body, flex: 1, color: colors.ink },
  remove: { minHeight: 48, minWidth: 48, justifyContent: 'center', padding: 8 },
  removeText: { ...typography.label, color: colors.danger },
  hint: { ...typography.bodySmall, color: colors.textMuted },
  error: { ...typography.bodySmall, color: colors.danger },
});
