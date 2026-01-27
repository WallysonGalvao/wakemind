/**
 * Feature Gate Component
 * Conditionally shows content or paywall based on subscription status
 */

import type { ReactNode } from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { AnalyticsEvents } from '@/analytics';
import { DashedBorder } from '@/components/dashed-border';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useFeatureAccess } from '@/hooks/use-feature-access';

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
 *
 * @example
 * <FeatureGate featureName="advanced_stats" upgradeMessage="Unlock advanced statistics">
 *   <AdvancedStatsComponent />
 * </FeatureGate>
 */
export function FeatureGate({
  featureName,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeMessage,
}: FeatureGateProps) {
  const { isPro, hasFeature } = useFeatureAccess();

  // Check if user has access to this specific feature
  const hasAccess = hasFeature(featureName);

  // Track feature gate hit for analytics
  if (!hasAccess) {
    AnalyticsEvents.featureGated(featureName, isPro);
  }

  // If user has access, show the feature
  if (hasAccess) {
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
  const { t } = useTranslation();

  const handleUpgrade = () => {
    AnalyticsEvents.paywallViewed(featureName);
    router.push('/subscription/paywall');
  };

  return (
    <DashedBorder
      lightColor="#135bec80"
      darkColor="#135bec"
      className="items-center justify-center rounded-2xl bg-primary-50/50 p-8 dark:bg-primary-900/20"
    >
      <View className="mb-4 rounded-full bg-primary-500/10 p-4">
        <MaterialSymbol name="workspace_premium" size={48} color={COLORS.brandPrimary} />
      </View>

      <Text className="mb-2 text-center text-lg font-bold text-gray-900 dark:text-white">
        {message || t('paywall.title')}
      </Text>

      <Text className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('paywall.subtitle')}
      </Text>

      <Pressable
        onPress={handleUpgrade}
        className="rounded-xl bg-primary-500 px-6 py-3"
        accessibilityRole="button"
        accessibilityLabel={t('settings.subscription.upgrade')}
        accessibilityHint={t('paywall.subtitle')}
      >
        <View className="flex-row items-center">
          <MaterialSymbol name="arrow_upward" size={20} color="#fff" />
          <Text className="ml-2 font-bold text-white">{t('settings.subscription.upgrade')}</Text>
        </View>
      </Pressable>
    </DashedBorder>
  );
}
