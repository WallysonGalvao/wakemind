/**
 * Analytics Service
 * Mixpanel implementation for tracking user behavior and events
 * Based on: https://docs.mixpanel.com/docs/tracking-methods/sdks/react-native
 */

import Constants from 'expo-constants';
import { Mixpanel } from 'mixpanel-react-native';

import { Platform } from 'react-native';

import MixPanelStorageAdapter from '@/utils/mixpanel-storage-adapter';

type EventProperties = Record<string, string | number | boolean | undefined>;

// Configuration
const trackAutomaticEvents = false; // Disable legacy mobile autotrack
const useNative = false; // Use Javascript Mode for better Expo compatibility

// Create Mixpanel instance with custom storage
export const mixpanel = new Mixpanel(
  Constants.expoConfig?.extra?.mixpanelToken || '',
  trackAutomaticEvents,
  useNative,
  MixPanelStorageAdapter
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

  // Performance Summary events
  performanceSummaryViewed: (streak: number, cognitiveScore: number, executionRate: number) =>
    logEvent('performance_summary_viewed', {
      streak,
      cognitive_score: cognitiveScore,
      execution_rate: executionRate,
    }),

  performanceSummaryShared: () => logEvent('performance_summary_shared'),

  // Subscription events
  paywallViewed: (source: string) => logEvent('paywall_viewed', { source }),

  paywallDismissed: (source: string, duration: number) =>
    logEvent('paywall_dismissed', { source, duration_seconds: duration }),

  subscriptionPurchased: (productId: string, price: string, period: string) =>
    logEvent('subscription_purchased', { product_id: productId, price, period }),

  subscriptionFailed: (productId: string, error: string) =>
    logEvent('subscription_failed', { product_id: productId, error }),

  subscriptionRestored: () => logEvent('subscription_restored'),

  subscriptionRestoreFailed: (error: string) => logEvent('subscription_restore_failed', { error }),

  subscriptionCancelled: (productId: string) =>
    logEvent('subscription_cancelled', { product_id: productId }),

  freeTrialStarted: (productId: string) =>
    logEvent('free_trial_started', { product_id: productId }),

  featureGated: (featureName: string, isPro: boolean) =>
    logEvent('feature_gated', { feature_name: featureName, is_pro: isPro }),

  // RevenueCat specific events
  offeringsLoaded: (offeringsCount: number, loadTime: number) =>
    logEvent('offerings_loaded', { count: offeringsCount, load_time_ms: loadTime }),

  offeringsLoadFailed: (error: string, retryCount?: number) =>
    logEvent('offerings_load_failed', { error, retry_count: retryCount }),

  packageSelected: (packageId: string, packageType: string) =>
    logEvent('package_selected', { package_id: packageId, package_type: packageType }),

  purchaseStarted: (packageId: string) => logEvent('purchase_started', { package_id: packageId }),

  purchaseCompleted: (packageId: string, duration: number) =>
    logEvent('purchase_completed', { package_id: packageId, duration_ms: duration }),

  purchaseCancelled: (packageId: string) =>
    logEvent('purchase_cancelled', { package_id: packageId }),

  restoreStarted: () => logEvent('restore_started'),

  restoreCompleted: (duration: number, hasActiveEntitlements: boolean) =>
    logEvent('restore_completed', {
      duration_ms: duration,
      has_entitlements: hasActiveEntitlements,
    }),

  customerInfoRefreshed: (isPro: boolean) => logEvent('customer_info_refreshed', { is_pro: isPro }),

  // Error tracking
  subscriptionError: (operation: string, error: string, metadata?: Record<string, unknown>) =>
    logEvent('subscription_error', { operation, error, ...metadata }),

  networkError: (operation: string, retryCount: number) =>
    logEvent('network_error', { operation, retry_count: retryCount }),

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
