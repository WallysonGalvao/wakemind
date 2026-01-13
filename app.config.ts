import 'dotenv/config';

import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'WakeMind',
  slug: 'wakemind',
  version: '1.0.0',
  owner: 'wallyson',
  updates: {
    url: 'https://u.expo.dev/45b9eb25-dff5-4cfe-9592-c8ea9c435316',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'wakemind',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.wgsoftwares.wakemind',
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
      backgroundColor: '#1A1A2E',
      foregroundImage: './assets/images/adaptive-icon.png',
    },
    edgeToEdgeEnabled: true,
    package: 'com.wgsoftwares.wakemind',
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
    'expo-audio',
    './plugins/withNotifee.js',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#302841',
        },
      },
    ],
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'wakemind',
        organization: 'wgsoftwares',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appId: process.env.APP_ID,
    sentryDNS: process.env.SENTRY_DSN,
    mixpanelToken: process.env.MIXPANEL_TOKEN,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '',
    },
  },
});
