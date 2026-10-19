import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';

type State = { failed: boolean };

// Last-resort screen for an uncaught render error. Safe-area handling is
// manual here because it can render outside any navigator.
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // MOCK: replace with crash reporting. Never log user data.
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.screen}>
        <Text accessibilityRole="header" style={styles.title}>
          Something went wrong
        </Text>
        <Text style={styles.message}>
          SpoonUp hit an unexpected problem. Your cart and orders are safe.
        </Text>
        <View style={styles.action}>
          <Button
            label="Try again"
            onPress={() => this.setState({ failed: false })}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: spacing.xxl,
    backgroundColor: colors.surface,
  },
  title: { ...typography.title, color: colors.ink, textAlign: 'center' },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: { marginTop: spacing.sm, minWidth: 200 },
});
