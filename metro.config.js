const { withRozenite } = require('@rozenite/metro');
const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const { withRozeniteExpoAtlasPlugin } = require('@rozenite/expo-atlas-plugin');

const config = getSentryExpoConfig(__dirname);

module.exports = withRozenite(withNativeWind(config, { input: './global.css' }), {
  // enabled: process.env.WITH_ROZENITE === 'true',
  enabled: true,
  enhanceMetroConfig: (config) => withRozeniteExpoAtlasPlugin(config),
});
