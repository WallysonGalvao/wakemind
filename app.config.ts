import 'dotenv/config';

import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'WakeMind',
  slug: 'wakemind',
  version: '1.1.0',
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
      NSUserNotificationsUsageDescription:
        'WakeMind needs notification permissions to schedule and trigger alarms to help you wake up.',
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
      'SYSTEM_ALERT_WINDOW',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
      'FOREGROUND_SERVICE',
      'WAKE_LOCK',
      'POST_NOTIFICATIONS',
      'REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
      'BILLING',
      'REORDER_TASKS',
      'DISABLE_KEYGUARD',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-asset',
    'expo-router',
    'expo-font',
    'expo-audio',
    './plugins/withNotifee.js',
    './plugins/withFullScreenIntent.js',
    './plugins/withAlarmIOS.js',
    './plugins/withSoundAssets.js',
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
    [
      'expo-build-properties',
      {
        android: {
          gradleProperties: {
            'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=1024m',
          },
        },
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
    revenueCatAppleApiKey: process.env.REVENUECAT_APPLE_API_KEY,
    revenueCatGoogleApiKey: process.env.REVENUECAT_GOOGLE_API_KEY,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '',
    },
  },
});
