/**
 * Feature Gate Component
 * Conditionally shows content or paywall based on subscription status
 */

import type { ReactNode } from 'react';

import { router } from 'expo-router';

import { Pressable, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

interface FeatureGateProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
}

/**
 * Feature Gate Component
 * Wraps premium features and shows upgrade prompt for free users
 */
export function FeatureGate({
  featureName,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeMessage,
}: FeatureGateProps) {
  const { isPro } = useSubscriptionStore();

  // Track feature gate hit
  if (!isPro) {
    AnalyticsEvents.featureGated(featureName, false);
  }

  // If user is pro, show the feature
  if (isPro) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgradePrompt) {
    return <UpgradePrompt message={upgradeMessage} featureName={featureName} />;
  }

  // Don't show anything
  return null;
}

/**
 * Upgrade Prompt Component
 */
function UpgradePrompt({ message, featureName }: { message?: string; featureName: string }) {
  const handleUpgrade = () => {
    AnalyticsEvents.paywallViewed(featureName);
    router.push('/subscription/paywall');
  };

  return (
    <View className="items-center justify-center rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/50 p-8 dark:border-primary-700 dark:bg-primary-900/20">
      <View className="mb-4 rounded-full bg-primary-500/10 p-4">
        <MaterialSymbol name="workspace_premium" size={48} color={COLORS.brandPrimary} />
      </View>

      <Text className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-white">
        {message || 'Premium Feature'}
      </Text>

      <Text className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Upgrade to unlock this feature and more
      </Text>

      <Pressable
        onPress={handleUpgrade}
        className="rounded-xl bg-primary-500 px-6 py-3"
        accessibilityRole="button"
        accessibilityLabel="Upgrade to Pro"
      >
        <View className="flex-row items-center">
          <MaterialSymbol name="arrow_upward" size={20} color="#fff" />
          <Text className="ml-2 font-bold text-white">Upgrade to Pro</Text>
        </View>
      </Pressable>
    </View>
  );
}

/**
 * Hook to check feature access
 */
export function useFeatureAccess(featureName: string): boolean {
  const { isPro, featureAccess } = useSubscriptionStore();

  // Map feature names to access checks
  const hasAccess = (() => {
    switch (featureName) {
      case 'unlimited_alarms':
        return featureAccess.canCreateAlarm(999); // Arbitrary high number
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
      default:
        return isPro;
    }
  })();

  if (!hasAccess) {
    AnalyticsEvents.featureGated(featureName, isPro);
  }

  return hasAccess;
}
