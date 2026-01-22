/**
 * useFeatureAccess Hook
 * Provides easy access to feature flags based on subscription status
 */

import { useCallback } from 'react';

import { router } from 'expo-router';

import { useSubscriptionStore } from '@/stores/use-subscription-store';

/**
 * Hook for checking feature access based on subscription status
 *
 * @example
 * const { canCreateAlarm, canUseDifficulty, showPaywallIfNeeded } = useFeatureAccess();
 *
 * // Check if user can create more alarms
 * if (!canCreateAlarm(currentAlarmCount)) {
 *   showPaywallIfNeeded('alarm_creation');
 *   return;
 * }
 *
 * // Check if user can use hard difficulty
 * if (!canUseDifficulty('hard')) {
 *   showPaywallIfNeeded('hard_difficulty');
 *   return;
 * }
 */
export function useFeatureAccess() {
  const { isPro, featureAccess, showPaywallIfNeeded } = useSubscriptionStore();

  /**
   * Check if user can create more alarms
   */
  const canCreateAlarm = useCallback(
    (currentCount: number): boolean => {
      return featureAccess.canCreateAlarm(currentCount);
    },
    [featureAccess]
  );

  /**
   * Check if user can use a specific difficulty
   */
  const canUseDifficulty = useCallback(
    (difficulty: string): boolean => {
      return featureAccess.canUseDifficulty(difficulty);
    },
    [featureAccess]
  );

  /**
   * Get the maximum history days available
   */
  const getHistoryDays = useCallback((): number => {
    return featureAccess.historyDays;
  }, [featureAccess]);

  /**
   * Get available streak freeze tokens
   */
  const getStreakFreezeTokens = useCallback((): number => {
    return featureAccess.streakFreezeTokens;
  }, [featureAccess]);

  /**
   * Navigate to paywall if user doesn't have access
   * Returns true if access was granted (isPro) or purchase was successful
   */
  const requirePremiumAccess = useCallback(
    async (_source?: string): Promise<boolean> => {
      if (isPro) return true;

      // Navigate to paywall
      router.push('/subscription/paywall');
      return false;
    },
    [isPro]
  );

  /**
   * Check access and show paywall if needed
   */
  const checkAccessAndShowPaywall = useCallback(
    async (hasAccess: boolean, source?: string): Promise<boolean> => {
      if (hasAccess) return true;

      return requirePremiumAccess(source);
    },
    [requirePremiumAccess]
  );

  /**
   * Check if user has access to a specific feature by name
   * This is the main method used by FeatureGate component
   */
  const hasFeature = useCallback(
    (featureName: string): boolean => {
      switch (featureName) {
        case 'unlimited_alarms':
          return featureAccess.canCreateAlarm(999); // Arbitrary high number for "unlimited" check
        case 'hard_difficulty':
          return featureAccess.canUseDifficulty('hard');
        case 'adaptive_difficulty':
          return featureAccess.canUseDifficulty('adaptive');
        case 'advanced_stats':
          return featureAccess.advancedStats;
        case 'custom_themes':
          return featureAccess.customThemes;
        case 'premium_sounds':
          return featureAccess.premiumSounds;
        case 'cloud_backup':
          return featureAccess.cloudBackup;
        case 'streak_freeze':
          return featureAccess.streakFreezeTokens > 0;
        case 'priority_support':
          return featureAccess.prioritySupport;
        default:
          return isPro;
      }
    },
    [featureAccess, isPro]
  );

  return {
    // Subscription status
    isPro,

    // Feature checks
    canCreateAlarm,
    canUseDifficulty,
    getHistoryDays,
    getStreakFreezeTokens,
    hasFeature,

    // Advanced features (boolean flags)
    advancedStats: featureAccess.advancedStats,
    customThemes: featureAccess.customThemes,
    premiumSounds: featureAccess.premiumSounds,
    cloudBackup: featureAccess.cloudBackup,
    prioritySupport: featureAccess.prioritySupport,

    // Actions
    requirePremiumAccess,
    checkAccessAndShowPaywall,
    showPaywallIfNeeded,
  };
}

/**
 * Type for feature names that can be gated
 */
export type FeatureName =
  | 'unlimited_alarms'
  | 'hard_difficulty'
  | 'adaptive_difficulty'
  | 'advanced_stats'
  | 'custom_themes'
  | 'premium_sounds'
  | 'cloud_backup'
  | 'streak_freeze'
  | 'priority_support';

/**
 * Check if a specific feature is available
 */
export function isFeatureAvailable(featureName: FeatureName, isPro: boolean): boolean {
  switch (featureName) {
    case 'unlimited_alarms':
    case 'hard_difficulty':
    case 'adaptive_difficulty':
    case 'advanced_stats':
    case 'custom_themes':
    case 'premium_sounds':
    case 'cloud_backup':
    case 'streak_freeze':
    case 'priority_support':
      return isPro;
    default:
      return false;
  }
}
