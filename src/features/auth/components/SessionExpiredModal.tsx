import { Modal, StyleSheet, Text, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/common/Button';
import { colors, radius, spacing, typography } from '../../../theme';
import { useAuth } from '../context/AuthContext';

// Shown when the API layer reports a 401 (see services/api/sessionEvents.ts).
// Must render inside NavigationContainer.
export const SessionExpiredModal = () => {
  const { sessionExpired, dismissSessionExpired } = useAuth();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const login = () => {
    dismissSessionExpired();
    queryClient.clear();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Auth' }] }),
    );
  };

  const browse = () => {
    dismissSessionExpired();
    queryClient.clear();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
    );
  };

  return (
    <Modal
      visible={sessionExpired}
      transparent
      animationType="fade"
      onRequestClose={browse}
    >
      <View style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          accessibilityLabel="Session expired"
          style={styles.card}
        >
          <Text accessibilityRole="header" style={styles.title}>
            Session expired
          </Text>
          <Text style={styles.message}>
            For your security you’ve been signed out. Log in again to continue.
            Your cart is saved.
          </Text>
          <Button label="Log in again" onPress={login} />
          <Button variant="outline" label="Keep browsing" onPress={browse} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(27, 42, 24, 0.45)',
  },
  card: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  title: { ...typography.title, color: colors.ink, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
