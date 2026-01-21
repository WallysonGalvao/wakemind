import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Pressable, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function SubscriptionCard() {
  const { t } = useTranslation();
  const router = useRouter();

  const { isPro, customerInfo } = useSubscriptionStore();

  const handlePress = async () => {
    if (isPro) {
      router.push('/subscription/account');
    } else {
      router.push('/subscription/paywall');
    }
  };

  // Get subscription expiration/renewal date
  const getSubscriptionDate = () => {
    if (!customerInfo?.entitlements.active['pro']) return null;

    const entitlement = customerInfo.entitlements.active['pro'];
    const expirationDate = entitlement.expirationDate;

    if (!expirationDate) return null;

    const date = new Date(expirationDate);
    const formattedDate = date.toLocaleDateString();

    return {
      date: formattedDate,
      willRenew: entitlement.willRenew,
    };
  };

  const subscriptionDate = getSubscriptionDate();

  if (isPro) {
    // Pro User Card - Similar to YearlyPricingCard
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('settings.subscription.manage')}
        accessibilityHint={t('settings.subscription.manageDescription')}
      >
        <View className="relative mb-8 w-full overflow-hidden rounded-2xl border border-primary-500 bg-white p-5 shadow-lg shadow-primary-500/20 dark:bg-[#1a2233]">
          {/* Badge */}
          <View className="absolute right-3 top-3 rounded bg-primary-500 px-2 py-1 shadow-lg shadow-primary-500/40">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
              {t('account.active')}
            </Text>
          </View>

          {/* Header Section */}
          <View className="mb-2 flex-row items-end justify-between">
            <View>
              <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary-500">
                {t('settings.subscription.pro')}
              </Text>
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('subscription.card.active.title')}
              </Text>
            </View>
          </View>

          <View className="my-4 h-px bg-gray-200 dark:bg-gray-800" />

          {/* Content Section */}
          <View className="flex-row items-center gap-2">
            <MaterialSymbol name="check_circle" size={18} color={COLORS.brandPrimary} />
            <Text className="text-sm font-medium text-gray-900 dark:text-white">
              {t('subscription.card.active.subtitle')}
            </Text>
          </View>

          {/* Subscription Date */}
          {subscriptionDate ? (
            <View className="mt-3 flex-row items-center gap-2">
              <MaterialSymbol name="event" size={18} color={COLORS.brandPrimary} />
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {subscriptionDate.willRenew
                  ? t('settings.subscription.renews', { date: subscriptionDate.date })
                  : t('settings.subscription.expires', { date: subscriptionDate.date })}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  // Free User Card - Similar to MonthlyPricingCard with CTA style
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('subscription.card.title')}
      accessibilityHint={t('subscription.card.subtitle')}
    >
      <View className="relative mb-8 w-full overflow-hidden rounded-2xl border border-primary-500 bg-white p-5 shadow-lg shadow-primary-500/20 dark:bg-[#1a2233]">
        {/* Badge */}
        <View className="absolute right-3 top-3 rounded bg-primary-500 px-2 py-1 shadow-lg shadow-primary-500/40">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
            {t('paywall.plans.trial')}
          </Text>
        </View>

        {/* Header Section */}
        <View className="mb-2">
          <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-primary-500">
            WakeMind Pro
          </Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('subscription.card.title')}
          </Text>
        </View>

        <View className="my-4 h-px bg-gray-200 dark:bg-gray-800" />

        {/* Features Preview */}
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <MaterialSymbol name="check_circle" size={18} color={COLORS.brandPrimary} />
            <Text className="text-sm font-medium text-gray-900 dark:text-white">
              {t('paywall.features.unlimitedAlarms.title')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MaterialSymbol name="check_circle" size={18} color={COLORS.brandPrimary} />
            <Text className="text-sm font-medium text-gray-900 dark:text-white">
              {t('paywall.features.advancedStats.title')}
            </Text>
          </View>
        </View>

        {/* CTA Arrow */}
        <View className="mt-4 flex-row items-center justify-end">
          <Text className="text-sm font-semibold text-primary-500">
            {t('settings.subscription.upgrade')}
          </Text>
          <MaterialSymbol name="arrow_forward" size={18} color={COLORS.brandPrimary} />
        </View>
      </View>
    </Pressable>
  );
}
