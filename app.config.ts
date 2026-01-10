import 'dotenv/config';

import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'wakemind',
  slug: 'wakemind',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'wakemind',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.wallyson.wakemind',
    infoPlist: {
      UIBackgroundModes: ['audio', 'fetch'],
    },
    // Temporarily commented out - requires Apple approval
    // entitlements: {
    //   'com.apple.developer.usernotifications.critical-alerts': true,
    // },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    package: 'com.wallyson.wakemind',
    permissions: [
      'SCHEDULE_EXACT_ALARM',
      'USE_EXACT_ALARM',
      'USE_FULL_SCREEN_INTENT',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
      'FOREGROUND_SERVICE',
      'WAKE_LOCK',
      'POST_NOTIFICATIONS',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
