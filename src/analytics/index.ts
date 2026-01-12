import analytics from '@react-native-firebase/analytics';

import { Platform } from 'react-native';

/**
 * Firebase Analytics Service
 * @see https://rnfirebase.io/analytics/usage
 */

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Screen tracking
export const logScreenView = async (screenName: string, screenClass?: string) => {
  if (!isNative) return;
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass ?? screenName,
    });
  } catch (error) {
    console.error('[Analytics] logScreenView error:', error);
  }
};

// Custom events
export const logEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean>
) => {
  if (!isNative) return;
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('[Analytics] logEvent error:', error);
  }
};

// User properties
export const setUserProperty = async (name: string, value: string) => {
  if (!isNative) return;
  try {
    await analytics().setUserProperty(name, value);
  } catch (error) {
    console.error('[Analytics] setUserProperty error:', error);
  }
};

export const setUserId = async (userId: string | null) => {
  if (!isNative) return;
  try {
    await analytics().setUserId(userId);
  } catch (error) {
    console.error('[Analytics] setUserId error:', error);
  }
};

// Predefined events for WakeMind
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
  appOpened: () => logEvent('app_opened'),
  appBackgrounded: () => logEvent('app_backgrounded'),
};

export default {
  logScreenView,
  logEvent,
  setUserProperty,
  setUserId,
  ...AnalyticsEvents,
};
