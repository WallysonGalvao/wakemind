import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';

import { PRO_FEATURES } from '../constants/pro-features';

import { Header } from '@/components/header';
import { MaterialSymbol } from '@/components/material-symbol';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { getManageSubscriptionURL, restorePurchases } from '@/services/revenue-cat-service';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

export default function AccountScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { customerInfo, isLoading } = useSubscriptionStore();

  // Get active entitlement info
  const proEntitlement = customerInfo?.entitlements.active['pro'];
  const expirationDate = proEntitlement?.expirationDate
    ? new Date(proEntitlement.expirationDate)
    : null;
  const willRenew = proEntitlement?.willRenew ?? false;

  // Determine plan type from product identifier
  const productId = proEntitlement?.productIdentifier ?? '';
  const isYearly = productId.toLowerCase().includes('year');
  const planName = isYearly ? t('account.planYearly') : t('account.planMonthly');
  const planPeriod = isYearly ? t('account.perYear') : t('account.perMonth');

  // Get price from active subscription
  const getFormattedPrice = () => {
    // Try to get price from store product if available
    const priceString = proEntitlement?.latestPurchaseDate ? '$--' : '--';
    return priceString;
  };

  const handleBack = () => {
    router.back();
  };

  const handleChangePlan = () => {
    router.push('/subscription/paywall');
  };

  const handleCancelSubscription = async () => {
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
      <Header
        title={t('account.title')}
        leftIcons={[
          {
            icon: <MaterialSymbol name="arrow_back_ios_new" size={20} color={COLORS.gray[900]} />,
            onPress: handleBack,
            accessibilityLabel: t('back.label'),
          },
        ]}
      />

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Current Plan Card */}
        <View className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1f32] p-6">
          {/* Decorative accent line */}
          <View className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-cyan-400/50 to-transparent opacity-50" />

          {/* Plan Header */}
          <View className="mb-6 flex-row items-start justify-between">
            <Text className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-400 opacity-90">
              {t('account.currentPlan')}
            </Text>
            <View className="rounded-full bg-cyan-400 px-3 py-1 shadow-lg shadow-cyan-400/30">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-[#0b1f32]">
                {t('account.active')}
              </Text>
            </View>
          </View>

          {/* Plan Details */}
          <Text className="mb-2 text-3xl font-bold leading-none tracking-tight text-white">
            {planName}
          </Text>
          {expirationDate ? (
            <Text className="mt-2 text-sm font-normal tracking-wide text-gray-400">
              {willRenew
                ? t('settings.subscription.renews', {
                    date: expirationDate.toLocaleDateString(),
                  })
                : t('settings.subscription.expires', {
                    date: expirationDate.toLocaleDateString(),
                  })}
            </Text>
          ) : null}
          <View className="mt-4 flex-row items-baseline gap-1">
            <Text className="text-xl font-bold text-white">{getFormattedPrice()}</Text>
            <Text className="text-sm text-gray-400">{planPeriod}</Text>
          </View>
        </View>

        {/* Features Section */}
        <View className="mb-8">
          <Text className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
            {t('account.includedFeatures')}
          </Text>
          <View className="rounded-2xl border border-white/5 bg-[#0b1f32] p-1">
            {PRO_FEATURES.map((feature, index) => (
              <View
                key={feature.titleKey}
                className={`flex-row items-center gap-4 p-4 ${
                  index < PRO_FEATURES.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <View className="h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <MaterialSymbol name={feature.icon} size={20} color="#ffffff" />
                </View>
                <Text className="text-base font-medium text-white/90">{t(feature.titleKey)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      <View className="gap-3 px-6 pb-8">
        {/* Change Plan */}
        <Pressable
          onPress={handleChangePlan}
          className="w-full overflow-hidden rounded-xl bg-[#2E2E2E] active:scale-[0.99]"
          accessibilityRole="button"
          accessibilityLabel={t('account.changePlan')}
          accessibilityHint={t('account.changePlan')}
        >
          <View className="flex-row items-center justify-between p-4 px-5">
            <Text className="text-[15px] font-semibold tracking-wide text-white">
              {t('account.changePlan')}
            </Text>
            <MaterialSymbol name="arrow_forward_ios" size={20} color="rgba(255, 255, 255, 0.4)" />
          </View>
        </Pressable>

        {/* Cancel Subscription */}
        <Pressable
          onPress={handleCancelSubscription}
          className="w-full overflow-hidden rounded-xl bg-[#2E2E2E] active:scale-[0.99]"
          accessibilityRole="button"
          accessibilityLabel={t('account.cancelSubscription')}
          accessibilityHint={t('account.cancelSubscription')}
        >
          <View className="flex-row items-center justify-between p-4 px-5">
            <Text className="text-[15px] font-semibold tracking-wide text-white">
              {t('account.cancelSubscription')}
            </Text>
            <MaterialSymbol name="arrow_forward_ios" size={20} color="rgba(255, 255, 255, 0.4)" />
          </View>
        </Pressable>

        {/* Restore Purchases */}
        <View className="mt-6 items-center">
          <Pressable
            onPress={handleRestorePurchases}
            disabled={isLoading}
            className="rounded-lg px-4 py-2"
            accessibilityRole="button"
            accessibilityLabel={t('account.restorePurchases')}
            accessibilityHint={t('account.restorePurchases')}
          >
            <Text className="text-sm font-semibold tracking-wide text-cyan-400">
              {t('account.restorePurchases')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
