import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, typography } from '../../../theme';
import { formatSize } from '../attachment';
import type { Attachment } from '../types';

// Files are private: the preview screen fetches a short-lived authorized URL.
export const AttachmentLink = ({ attachment }: { attachment: Attachment }) => {
  const navigation = useNavigation();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Preview attachment ${attachment.name}`}
      onPress={() =>
        navigation.navigate('AttachmentPreview', {
          attachmentId: attachment.id,
          name: attachment.name,
          mimeType: attachment.mimeType,
          size: attachment.size,
        })
      }
      style={styles.link}
    >
      <Text style={styles.text} numberOfLines={1}>
        {attachment.name} · {formatSize(attachment.size)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  link: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  text: { ...typography.label, color: colors.olive },
});
