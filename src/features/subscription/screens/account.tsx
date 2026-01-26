import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';

import { FeatureRow, ProBadge } from '../components/paywall-features';
import { PRO_FEATURES } from '../constants/pro-features';

import { AnalyticsEvents } from '@/analytics';
import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { useAnalyticsScreen } from '@/hooks/use-analytics-screen';
import { getManageSubscriptionURL, restorePurchases } from '@/services/revenue-cat-service';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Analytics tracking
  useAnalyticsScreen('Account');

  const { customerInfo } = useSubscriptionStore();

  // Get active entitlement info
  const proEntitlement = customerInfo?.entitlements.active['pro'];
  const expirationDate = proEntitlement?.expirationDate
    ? dayjs(proEntitlement.expirationDate).toDate()
    : null;
  const willRenew = proEntitlement?.willRenew ?? false;

  // Determine plan type from product identifier
  const productId = proEntitlement?.productIdentifier ?? '';
  const isYearly = productId.toLowerCase().includes('year');
  const planName = isYearly ? t('account.planYearly') : t('account.planMonthly');
  const planPeriod = isYearly ? t('account.perYear') : t('account.perMonth');

  // Get price from active subscription
  const getFormattedPrice = () => {
    const priceString = proEntitlement?.latestPurchaseDate ? '$--' : '--';
    return priceString;
  };

  const handleBack = () => {
    router.back();
  };

  const handleChangePlan = () => {
    // Determine mode based on subscription status:
    // - No active subscription: show full paywall
    // - Yearly subscription: show only monthly option (downgrade)
    // - Monthly subscription: show only yearly option (upgrade)
    let mode: 'full' | 'yearly-only' | 'monthly-only' = 'full';

    if (proEntitlement) {
      mode = isYearly ? 'monthly-only' : 'yearly-only';
    }

    router.push(`/subscription/paywall?mode=${mode}`);
  };

  const handleCancelSubscription = async () => {
    AnalyticsEvents.manageSubscriptionTapped();
    const managementURL = await getManageSubscriptionURL();

    if (managementURL) {
      await Linking.openURL(managementURL);
    } else {
      Alert.alert(t('settings.subscription.manage'), t('settings.subscription.manageDescription'), [
        { text: 'OK' },
      ]);
    }
  };

  const handleRestorePurchases = async () => {
    const result = await restorePurchases();

    if (result.success) {
      Alert.alert(t('paywall.restore.success'), t('paywall.restore.message'));
    } else {
      Alert.alert(t('paywall.restore.failed'), t('paywall.restore.notFound'));
    }
  };

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={t('account.title')}
          leftIcons={[
            {
              icon: (
                <MaterialSymbol
                  name="arrow_back_ios_new"
                  size={20}
                  className="text-gray-900 dark:text-white"
                />
              ),
              onPress: handleBack,
              accessibilityLabel: t('back.label'),
            },
          ]}
          rightIcons={[
            {
              label: (
                <Text className="text-sm font-semibold text-primary-500">
                  {t('account.restorePurchases')}
                </Text>
              ),
              onPress: handleRestorePurchases,
              accessibilityLabel: t('account.restorePurchases'),
            },
          ]}
        />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Title Section - Same as Paywall */}
        <View className="pb-2 pt-4">
          <ProBadge />
          <Text className="mb-2 text-[2.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white">
            {planName}
          </Text>
          <Text className="text-base font-normal leading-relaxed text-gray-500 dark:text-gray-400">
            {expirationDate
              ? willRenew
                ? t('settings.subscription.renews', {
                    date: expirationDate.toLocaleDateString(),
                  })
                : t('settings.subscription.expires', {
                    date: expirationDate.toLocaleDateString(),
                  })
              : t('subscription.card.active.subtitle')}
          </Text>
          <View className="mt-4 flex-row items-baseline gap-1">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {getFormattedPrice()}
            </Text>
            <Text className="text-sm text-gray-400">{planPeriod}</Text>
          </View>
        </View>

        {/* Features Section - Same as Paywall */}
        <View className="py-6">
          <Text className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
            {t('account.includedFeatures')}
          </Text>
          <View className="gap-4">
            {PRO_FEATURES.map((feature) => (
              <FeatureRow
                key={feature.titleKey}
                icon={feature.icon}
                title={t(feature.titleKey)}
                description={t(feature.descriptionKey)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View className="gap-4 px-6 pb-4">
        {/* Change Plan Button - Same style as Paywall CTA */}
        <Pressable
          onPress={handleChangePlan}
          accessibilityRole="button"
          accessibilityLabel={t('account.changePlan')}
          accessibilityHint={t('account.changePlan')}
          className="h-14 w-full items-center justify-center rounded-xl bg-primary-500 px-4 shadow-lg shadow-primary-500/20 active:scale-[0.98]"
        >
          <Text className="text-base font-bold uppercase tracking-wide text-white">
            {t('account.changePlan')}
          </Text>
        </Pressable>

        {/* Cancel Subscription - Text link */}
        <View className="items-center">
          <Pressable
            onPress={handleCancelSubscription}
            accessibilityRole="button"
            accessibilityLabel={t('account.cancelSubscription')}
            accessibilityHint={t('account.cancelSubscription')}
          >
            <Text className="text-sm font-semibold text-red-500 underline">
              {t('account.cancelSubscription')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
