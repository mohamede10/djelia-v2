// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Fichiers du template Expo d'origine (expo-router), non utilisés par l'application.
    files: ['components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}', 'constants/**/*.{ts,tsx}'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
]);
