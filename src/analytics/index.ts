import analytics from '@react-native-firebase/analytics';

/**
 * Firebase Analytics Service
 * @see https://rnfirebase.io/analytics/usage
 */

// Screen tracking
export const logScreenView = async (screenName: string, screenClass?: string) => {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass ?? screenName,
  });
};

// Custom events
export const logEvent = async (
  eventName: string,
  params?: Record<string, string | number | boolean>
) => {
  await analytics().logEvent(eventName, params);
};

// User properties
export const setUserProperty = async (name: string, value: string) => {
  await analytics().setUserProperty(name, value);
};

export const setUserId = async (userId: string | null) => {
  await analytics().setUserId(userId);
};

// Predefined events for WakeMind
export const AnalyticsEvents = {
  // Alarm events
  alarmCreated: (alarmId: string, time: string) =>
    logEvent('alarm_created', { alarm_id: alarmId, time }),

  alarmDeleted: (alarmId: string) => logEvent('alarm_deleted', { alarm_id: alarmId }),

  alarmToggled: (alarmId: string, enabled: boolean) =>
    logEvent('alarm_toggled', { alarm_id: alarmId, enabled }),

  alarmTriggered: (alarmId: string) => logEvent('alarm_triggered', { alarm_id: alarmId }),

  alarmDismissed: (alarmId: string, method: 'button' | 'shake' | 'puzzle') =>
    logEvent('alarm_dismissed', { alarm_id: alarmId, method }),

  alarmSnoozed: (alarmId: string, snoozeMinutes: number) =>
    logEvent('alarm_snoozed', { alarm_id: alarmId, snooze_minutes: snoozeMinutes }),

  // Onboarding events
  onboardingStarted: () => logEvent('onboarding_started'),
  onboardingCompleted: () => logEvent('onboarding_completed'),
  onboardingSkipped: (step: string) => logEvent('onboarding_skipped', { step }),

  // Settings events
  settingsChanged: (setting: string, value: string) =>
    logEvent('settings_changed', { setting, value }),

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
