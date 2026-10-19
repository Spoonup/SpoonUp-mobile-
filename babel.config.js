module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: process.env.ENV_FILE || '.env',
        safe: false,
        allowUndefined: false,
      },
    ],
  ],
};
