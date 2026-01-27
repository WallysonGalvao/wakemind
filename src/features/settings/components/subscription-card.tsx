import { useState } from 'react';

import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';

import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { FeatureRow } from '@/features/subscription/components/paywall-features';
import { PRO_FEATURES } from '@/features/subscription/constants/pro-features';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export function SubscriptionCard() {
  const { t } = useTranslation();
  const router = useRouter();

  const { isPro, customerInfo } = useSubscriptionStore();

  // Carousel state for free user card
  const [currentFeaturePage, setCurrentFeaturePage] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  const FEATURES_PER_PAGE = 1;
  const totalPages = Math.ceil(PRO_FEATURES.length / FEATURES_PER_PAGE);

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

    const date = dayjs(expirationDate).toDate();
    const formattedDate = date.toLocaleDateString();

    return {
      date: formattedDate,
      willRenew: entitlement.willRenew,
    };
  };

  const subscriptionDate = getSubscriptionDate();

  // Handle feature scroll
  const handleFeatureScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / screenWidth);
    setCurrentFeaturePage(page);
  };

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
          {/* Decorative Icon */}
          <View className="absolute right-4 top-1.5 opacity-[0.08] dark:opacity-10">
            <MaterialSymbol
              name="workspace_premium"
              size={120}
              className="text-slate-900 dark:text-primary-500"
            />
          </View>

          {/* Badge */}
          <View className="absolute right-3 top-3 z-10 rounded bg-primary-500 px-2 py-1 shadow-lg shadow-primary-500/40">
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
    <View className="relative mb-8 w-full overflow-hidden rounded-2xl border border-primary-500 bg-white p-5 shadow-lg shadow-primary-500/20 dark:bg-[#1a2233]">
      {/* Decorative Icon */}
      <View className="absolute right-4 top-1.5 opacity-[0.08] dark:opacity-10">
        <MaterialSymbol
          name="workspace_premium"
          size={120}
          className="text-slate-900 dark:text-primary-500"
        />
      </View>

      {/* Badge */}
      <View className="absolute right-3 top-3 z-10 rounded bg-primary-500 px-2 py-1 shadow-lg shadow-primary-500/40">
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

      {/* Features Preview - Horizontal Carousel */}
      <View className="-mx-5">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleFeatureScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="start"
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const startIdx = pageIndex * FEATURES_PER_PAGE;
            const endIdx = Math.min(startIdx + FEATURES_PER_PAGE, PRO_FEATURES.length);
            const pageFeatures = PRO_FEATURES.slice(startIdx, endIdx);

            return (
              <View key={pageIndex} style={{ width: screenWidth }} className="px-2">
                {pageFeatures.map((feature) => (
                  <FeatureRow
                    key={feature.titleKey}
                    icon={feature.icon}
                    title={t(feature.titleKey)}
                    description={t(feature.descriptionKey)}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>

        {/* Dots Indicator */}
        {totalPages > 1 ? (
          <View className="mt-3 flex-row items-center justify-center gap-2 px-5">
            {Array.from({ length: totalPages }).map((_, index) => (
              <View
                key={index}
                className={`h-1.5 rounded-full ${
                  index === currentFeaturePage
                    ? 'w-4 bg-primary-500'
                    : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </View>
        ) : null}
      </View>

      {/* CTA Arrow */}
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('subscription.card.title')}
        accessibilityHint={t('subscription.card.subtitle')}
        className="mt-4 flex-row items-center justify-end"
      >
        <Text className="text-sm font-semibold text-primary-500">
          {t('settings.subscription.upgrade')}
        </Text>
        <MaterialSymbol name="arrow_forward" size={18} color={COLORS.brandPrimary} />
      </Pressable>
    </View>
  );
}
