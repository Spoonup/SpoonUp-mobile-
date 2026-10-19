import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../components/common/Button';
import { ErrorState } from '../../../components/common/ErrorState';
import { ScreenHeader } from '../../../components/common/ScreenHeader';
import { Skeleton } from '../../../components/common/Skeleton';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, radius, spacing, typography } from '../../../theme';
import { formatSize } from '../attachment';
import { supportService } from '../services/supportService';

type Props = NativeStackScreenProps<RootStackParamList, 'AttachmentPreview'>;

// Images render inline; PDFs hand off to the system viewer (no WebView dep).
export const AttachmentPreviewScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { attachmentId, name, mimeType, size } = route.params;
  const isImage = mimeType.startsWith('image/');
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [openFailed, setOpenFailed] = useState(false);
  // Authorized URLs are short-lived: never cache them.
  const {
    data: url,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['attachment-url', attachmentId],
    queryFn: () => supportService.getAttachmentUrl(attachmentId),
    gcTime: 0,
    staleTime: 0,
  });

  const openExternally = async () => {
    setOpenFailed(false);
    try {
      if (url) await Linking.openURL(url);
    } catch {
      setOpenFailed(true);
    }
  };

  const retry = () => {
    setImageFailed(false);
    setImageLoading(true);
    refetch();
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.pad}>
          <Skeleton height={320} borderRadius={radius.lg} />
        </View>
      );
    }
    if (isError || !url || imageFailed) {
      return (
        <ErrorState
          message="We couldn’t load this file. It may have expired or you may be offline."
          onRetry={retry}
        />
      );
    }
    return (
      <View style={styles.body}>
        {isImage ? (
          <View style={styles.imageWrap}>
            <Image
              accessibilityLabel={`Attachment ${name}`}
              source={{ uri: url }}
              style={styles.image}
              resizeMode="contain"
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageFailed(true)}
            />
            {imageLoading ? (
              <ActivityIndicator style={StyleSheet.absoluteFill} />
            ) : null}
          </View>
        ) : (
          <View style={styles.doc}>
            <Text style={styles.docTitle}>PDF document</Text>
            <Text style={styles.meta}>Opens in your device’s PDF viewer.</Text>
          </View>
        )}
        <Text style={styles.meta} numberOfLines={2}>
          {name} · {formatSize(size)}
        </Text>
        {openFailed ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            Couldn’t open the file. Try again.
          </Text>
        ) : null}
        <Button
          variant={isImage ? 'outline' : 'primary'}
          label={isImage ? 'Open in browser' : 'Open PDF'}
          onPress={openExternally}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md },
      ]}
    >
      <ScreenHeader title="Attachment" onBack={navigation.goBack} />
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  pad: { padding: spacing.xl },
  body: { flex: 1, gap: spacing.md, padding: spacing.xl },
  imageWrap: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: { flex: 1 },
  doc: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  docTitle: { ...typography.title, color: colors.ink },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  error: { ...typography.bodySmall, color: colors.danger },
});
