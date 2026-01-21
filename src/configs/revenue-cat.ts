/**
 * RevenueCat Configuration
 * Centralized configuration for in-app purchases and subscriptions
 */

import Constants from 'expo-constants';

import { Platform } from 'react-native';

/**
 * RevenueCat API Keys
 * Using test key for development: test_brhnDrWRyBlNoHVTqHlmssTpNhV
 */
export const REVENUE_CAT_CONFIG = {
  apiKey: __DEV__
    ? 'test_brhnDrWRyBlNoHVTqHlmssTpNhV' // Test API key
    : (Platform.select({
        ios: Constants.expoConfig?.extra?.revenueCatAppleApiKey || '',
        android: Constants.expoConfig?.extra?.revenueCatGoogleApiKey || '',
      }) as string),
  // Enable debug logs in development
  enableDebugLogs: __DEV__,
};

/**
 * Entitlement identifiers
 * These match the entitlements configured in RevenueCat dashboard
 */
export enum Entitlement {
  PRO = 'WakeMind Pro',
}

/**
 * Product identifiers
 * These match the product IDs in App Store Connect / Google Play Console
 */
export enum ProductId {
  // Monthly subscription
  MONTHLY = 'monthly',
  // Yearly subscription (discounted)
  YEARLY = 'yearly',
}

/**
 * Offering identifiers
 * These match the offerings configured in RevenueCat dashboard
 */
export enum OfferingId {
  DEFAULT = 'default',
  ONBOARDING = 'onboarding',
  PROMOTIONAL = 'promotional',
}

/**
 * Free tier limits
 * Define what free users can access
 */
export const FREE_TIER_LIMITS = {
  maxAlarms: 3,
  maxHistoryDays: 30,
  availableDifficulties: ['easy', 'medium'] as const,
  availableChallenges: ['math', 'memory', 'logic'] as const,
  streakFreeze: 0, // Number of freeze tokens
};

/**
 * Premium tier features
 * Define what premium users get
 */
export const PREMIUM_FEATURES = {
  unlimitedAlarms: true,
  maxHistoryDays: 365,
  availableDifficulties: ['easy', 'medium', 'hard', 'adaptive'] as const,
  availableChallenges: ['math', 'memory', 'logic'] as const,
  streakFreeze: 3, // Number of freeze tokens per month
  advancedStats: true,
  customThemes: true,
  premiumSounds: true,
  cloudBackup: true,
  adFree: true,
  prioritySupport: true,
};

/**
 * Feature flags based on entitlement
 */
export const getFeatureAccess = (isPro: boolean) => ({
  // Alarm limits
  canCreateAlarm: (currentCount: number) =>
    isPro ? true : currentCount < FREE_TIER_LIMITS.maxAlarms,

  // Difficulty access
  canUseDifficulty: (difficulty: string) =>
    isPro
      ? PREMIUM_FEATURES.availableDifficulties.includes(difficulty as any)
      : FREE_TIER_LIMITS.availableDifficulties.includes(difficulty as any),

  // History access
  historyDays: isPro ? PREMIUM_FEATURES.maxHistoryDays : FREE_TIER_LIMITS.maxHistoryDays,

  // Streak freeze
  streakFreezeTokens: isPro ? PREMIUM_FEATURES.streakFreeze : FREE_TIER_LIMITS.streakFreeze,

  // Advanced features
  advancedStats: isPro && PREMIUM_FEATURES.advancedStats,
  customThemes: isPro && PREMIUM_FEATURES.customThemes,
  premiumSounds: isPro && PREMIUM_FEATURES.premiumSounds,
  cloudBackup: isPro && PREMIUM_FEATURES.cloudBackup,
  prioritySupport: isPro && PREMIUM_FEATURES.prioritySupport,
});

/**
 * Pricing display (these are base prices, actual prices come from stores)
 */
export const PRICING = {
  [ProductId.MONTHLY]: {
    displayPrice: '$4.99',
    period: 'month',
  },
  [ProductId.YEARLY]: {
    displayPrice: '$29.99',
    period: 'year',
    savings: '50%', // vs monthly
  },
};
