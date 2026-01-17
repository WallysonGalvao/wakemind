/**
 * Analytics Service
 * Mixpanel implementation for tracking user behavior and events
 * Based on: https://docs.mixpanel.com/docs/tracking-methods/sdks/react-native
 */

import Constants from 'expo-constants';
import { Mixpanel } from 'mixpanel-react-native';

import { Platform } from 'react-native';

type EventProperties = Record<string, string | number | boolean | undefined>;

// Configuration
const trackAutomaticEvents = false; // Disable legacy mobile autotrack
const useNative = false; // Use Javascript Mode for better Expo compatibility

// Create Mixpanel instance
export const mixpanel = new Mixpanel(
  Constants.expoConfig?.extra?.mixpanelToken || '',
  trackAutomaticEvents,
  useNative
);

// Track initialization state
let isInitialized = false;

/**
 * Logs screen view
 * @param screenName - Name of the screen
 * @param properties - Additional properties (optional)
 */
export async function logScreenView(
  screenName: string,
  properties?: EventProperties
): Promise<void> {
  if (!isInitialized) return;

  try {
    mixpanel.track('Screen View', {
      screen_name: screenName,
      ...properties,
    });
  } catch (error) {
    console.error('[Analytics] Error logging screen view:', error);
  }
}

/**
 * Logs custom event
 * @param eventName - Name of the event
 * @param properties - Event properties (optional)
 */
export async function logEvent(eventName: string, properties?: EventProperties): Promise<void> {
  if (!isInitialized) return;

  try {
    mixpanel.track(eventName, properties);
  } catch (error) {
    console.error('[Analytics] Error logging event:', error);
  }
}

/**
 * Sets user property
 * Note: You must call identify() first before setting user properties
 * @param name - Property name
 * @param value - Property value
 */
export async function setUserProperty(name: string, value: string): Promise<void> {
  if (!isInitialized) return;

  try {
    mixpanel.getPeople().set(name, value);
  } catch (error) {
    console.error('[Analytics] Error setting user property:', error);
  }
}

/**
 * Sets user ID and identifies the user
 * Call this when you know the user's identity (e.g., after login)
 * @param userId - The user's unique ID (null to reset)
 */
export async function setUserId(userId: string | null): Promise<void> {
  if (!isInitialized) return;

  try {
    if (userId) {
      mixpanel.identify(userId);
    } else {
      mixpanel.reset();
    }
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
}

/**
 * Resets user data (call on logout)
 * Clears local storage and generates new distinct_id
 */
export async function resetAnalytics(): Promise<void> {
  if (!isInitialized) return;

  try {
    mixpanel.reset();
  } catch (error) {
    console.error('[Analytics] Error resetting:', error);
  }
}

/**
 * Manually flush queued events
 * Useful for important events that need immediate tracking
 */
export async function flush(): Promise<void> {
  if (!isInitialized) return;

  try {
    mixpanel.flush();
  } catch (error) {
    console.error('[Analytics] Error flushing:', error);
  }
}

// =============================================================================
// WakeMind Predefined Events
// =============================================================================

export const AnalyticsEvents = {
  // Alarm events
  alarmCreated: (alarmId: string, time: string, challengeType: string) =>
    logEvent('alarm_created', { alarm_id: alarmId, time, challenge_type: challengeType }),

  alarmUpdated: (alarmId: string) => logEvent('alarm_updated', { alarm_id: alarmId }),

  alarmDeleted: (alarmId: string) => logEvent('alarm_deleted', { alarm_id: alarmId }),

  alarmToggled: (alarmId: string, enabled: boolean) =>
    logEvent('alarm_toggled', { alarm_id: alarmId, enabled }),

  alarmTriggered: (alarmId: string, time: string) =>
    logEvent('alarm_triggered', { alarm_id: alarmId, time }),

  alarmDismissed: (alarmId: string, challengeType: string, attemptCount: number) =>
    logEvent('alarm_dismissed', {
      alarm_id: alarmId,
      challenge_type: challengeType,
      attempt_count: attemptCount,
    }),

  alarmSnoozed: (alarmId: string) => logEvent('alarm_snoozed', { alarm_id: alarmId }),

  // Challenge events
  challengeStarted: (challengeType: string, difficulty: string) =>
    logEvent('challenge_started', { challenge_type: challengeType, difficulty }),

  challengeCompleted: (challengeType: string, difficulty: string, attempts: number) =>
    logEvent('challenge_completed', {
      challenge_type: challengeType,
      difficulty,
      attempts,
    }),

  challengeFailed: (challengeType: string, difficulty: string) =>
    logEvent('challenge_failed', { challenge_type: challengeType, difficulty }),

  // Onboarding events
  onboardingStarted: () => logEvent('onboarding_started'),
  onboardingCompleted: () => logEvent('onboarding_completed'),
  onboardingSkipped: (step: number) => logEvent('onboarding_skipped', { step }),

  // Settings events
  settingsChanged: (setting: string, value: string) =>
    logEvent('settings_changed', { setting, value }),

  themeChanged: (theme: string) => logEvent('theme_changed', { theme }),

  languageChanged: (language: string) => logEvent('language_changed', { language }),

  alarmToneChanged: (toneId: string) => logEvent('alarm_tone_changed', { tone_id: toneId }),

  vibrationPatternChanged: (pattern: string) => logEvent('vibration_pattern_changed', { pattern }),

  // App lifecycle
  appOpened: () => {
    logEvent('app_opened');
    // Flush immediately for app lifecycle events in Javascript Mode
    if (Platform.OS !== 'web') {
      flush();
    }
  },

  appBackgrounded: () => {
    logEvent('app_backgrounded');
    // Flush immediately when app goes to background in Javascript Mode
    if (Platform.OS !== 'web') {
      flush();
    }
  },
};

export default {
  logScreenView,
  logEvent,
  setUserProperty,
  setUserId,
  resetAnalytics,
  flush,
  mixpanel,
  ...AnalyticsEvents,
};

/**
 * Initializes Mixpanel and marks as ready
 */
try {
  mixpanel.init();
  isInitialized = true;
} catch (_error) {
  // Silently fail - analytics is not critical
}
