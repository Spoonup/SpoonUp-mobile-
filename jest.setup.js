/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The native WebView module does not exist under Jest.
jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));

// Test-only defaults so suites never depend on a local .env.
process.env.EXPO_PUBLIC_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5001';
process.env.EXPO_PUBLIC_USE_MOCKS = 'true';
