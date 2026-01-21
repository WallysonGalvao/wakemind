/**
 * Subscription Card Component
 * Displays current subscription status in Settings
 */

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ActivityIndicator, Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShadowStyle } from '@/hooks/use-shadow-style';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function SubscriptionCard() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const shadowStyle = useShadowStyle('md');
  const isDark = colorScheme === 'dark';

  const { isPro, isLoading } = useSubscriptionStore();

  const handleManageSubscription = () => {
    // TODO: Open platform-specific subscription management
    // iOS: App Store subscriptions
    // Android: Google Play subscriptions
  };

  const handleUpgrade = () => {
    router.push('/subscription/paywall');
  };

  if (isLoading) {
    return (
      <View className="dark:border-surface-border rounded-2xl border border-gray-200 bg-white p-6 dark:bg-surface-dark">
        <ActivityIndicator color={COLORS.brandPrimary} />
      </View>
    );
  }

  return (
    <View
      className="dark:border-surface-border rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 dark:from-surface-dark dark:to-background-dark"
      style={shadowStyle}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className={`mr-3 rounded-full p-2 ${isPro ? 'bg-yellow-500/10' : 'bg-gray-500/10'}`}
          >
            <MaterialSymbol
              name={isPro ? 'workspace_premium' : 'verified'}
              size={24}
              color={isPro ? '#EAB308' : '#6B7280'}
            />
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {t('settings.subscription.title')}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.subscription.status')}:{' '}
              {isPro ? t('settings.subscription.pro') : t('settings.subscription.free')}
            </Text>
          </View>
        </View>

        {isPro ? (
          <View className="rounded-full bg-green-500/10 px-3 py-1">
            <Text className="text-xs font-semibold text-green-500">Active</Text>
          </View>
        ) : null}
      </View>

      {/* Pro Features Summary */}
      {isPro ? (
        <View className="mb-4 rounded-xl bg-yellow-50/50 p-4 dark:bg-yellow-900/10">
          <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            ✨ {t('paywall.features.title')}
          </Text>
          <View className="space-y-1">
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              • {t('paywall.features.unlimitedAlarms.title')}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              • {t('paywall.features.advancedStats.title')}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              • {t('paywall.features.streakFreeze.title')}
            </Text>
          </View>
        </View>
      ) : (
        <View className="mb-4 rounded-xl bg-blue-50/50 p-4 dark:bg-blue-900/10">
          <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            🎁 {t('settings.subscription.upgrade')}:
          </Text>
          <View className="space-y-1">
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              • {t('paywall.features.unlimitedAlarms.description')}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              • {t('paywall.features.allDifficulties.title')}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              • {t('paywall.features.advancedStats.title')}
            </Text>
          </View>
        </View>
      )}

      {/* CTA Button */}
      <Pressable
        onPress={isPro ? handleManageSubscription : handleUpgrade}
        className={`rounded-xl px-4 py-3 ${isPro
            ? 'border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
            : 'bg-primary-500'
          }`}
        accessibilityRole="button"
        accessibilityLabel={
          isPro ? t('settings.subscription.manage') : t('settings.subscription.upgrade')
        }
      >
        <View className="flex-row items-center justify-center">
          <MaterialSymbol
            name={isPro ? 'settings' : 'arrow_upward'}
            size={20}
            color={isPro ? (isDark ? '#fff' : '#000') : '#fff'}
          />
          <Text
            className={`ml-2 font-bold ${isPro ? 'text-gray-900 dark:text-white' : 'text-white'}`}
          >
            {isPro ? t('settings.subscription.manage') : t('settings.subscription.upgrade')}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
