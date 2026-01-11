import * as Sentry from '@sentry/react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import { Platform } from 'react-native';

import type { UserOrm } from '@/graphql';
import { useUserStore } from '@/stores/use-user-store';

const isDev = __DEV__;

function getSentryUser(user: UserOrm | null): Sentry.User | null {
  if (!user || !user.id) return null;

  return {
    id: user.id ?? undefined,
    email: user.email ?? undefined,
    username: user.user_name ?? undefined,
  };
}

Sentry.init({
  dsn: Constants.expoConfig?.extra?.sentryDNS,
  environment: isDev ? 'development' : 'production',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: isDev,

  attachScreenshot: !isDev,
  debug: false,

  tracesSampleRate: isDev ? 1.0 : 0.1,

  // Configure Session Replay
  profilesSampleRate: isDev ? 1.0 : 0.05, // Only during debugging, change to lower value in production
  // replaysSessionSampleRate: isDev ? 0.1 : 0.01, // Only during debugging, change to lower value in production
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
    }),
    Sentry.feedbackIntegration(),
    ...(isDev ? [Sentry.spotlightIntegration()] : []),
  ],

  beforeSend(event) {
    event.contexts = {
      ...event.contexts,
      device: {
        platform: Platform.OS,
        appVersion: Application?.nativeApplicationVersion || 'unknown',
        buildNumber: Application?.nativeBuildVersion || 'unknown',
      },
    };
    return event;
  },

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: isDev,
});

Sentry.setUser(getSentryUser(useUserStore.getState().user));
