// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // SDK 57's React Compiler lint rules are stricter than the existing
    // app patterns. Keep the upgrade focused and migrate these patterns
    // incrementally rather than changing runtime behavior in this batch.
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
