import { useEffect, useState } from 'react';

import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { FeatureRow, ProBadge } from '../components/paywall-features';
import { PaywallFooter } from '../components/paywall-footer';
import { usePaywallHeader } from '../components/paywall-header';
import { MonthlyPricingCard, YearlyPricingCard } from '../components/paywall-pricing-cards';
import { PRO_FEATURES } from '../constants/pro-features';
import type { PlanType } from '../hooks/use-paywall-actions';
import { usePaywallActions } from '../hooks/use-paywall-actions';
import { usePaywallPackages } from '../hooks/use-paywall-packages';
import { formatPackagePrice, usePricingSavings } from '../hooks/use-pricing-calculations';

import { AnalyticsEvents } from '@/analytics';
import { Text } from '@/components/ui/text';
import { useSubscriptionStore } from '@/stores/use-subscription-store';

// Mode types for paywall display
// 'full' - show all plans (default, for free users)
// 'yearly-only' - show only yearly plan (for monthly subscribers wanting to upgrade)
// 'monthly-only' - show only monthly plan (for yearly subscribers wanting to switch)
export type PaywallMode = 'full' | 'yearly-only' | 'monthly-only';

export default function PaywallScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: PaywallMode; source?: string }>();

  // Determine display mode from params (default to 'full')
  const mode: PaywallMode = params.mode || 'full';
  const source = params.source || 'unknown';

  const { offerings, isLoading, loadingState, error, loadOfferings } = useSubscriptionStore();

  // Track paywall view time for analytics
  const [viewStartTime] = useState(Date.now());

  // Set initial selected plan based on mode
  const getInitialPlan = (): PlanType => {
    if (mode === 'monthly-only') return 'monthly';
    return 'yearly';
  };

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(getInitialPlan);

  // Handle plan selection with analytics
  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);

    // Track package selection
    const pkg = plan === 'yearly' ? yearlyPackage : monthlyPackage;
    if (pkg) {
      AnalyticsEvents.packageSelected(pkg.identifier, plan);
    }
  };

  // Extract packages from offerings (memoized)
  const { monthly: monthlyPackage, yearly: yearlyPackage } = usePaywallPackages(offerings);

  // Calculate pricing savings (memoized)
  const yearlySavings = usePricingSavings(monthlyPackage, yearlyPackage);

  // Actions handlers (memoized)
  const { handleClose, handlePurchase, handleRestore } = usePaywallActions({
    selectedPlan,
    monthlyPackage,
    yearlyPackage,
  });

  // Configure header
  usePaywallHeader({
    onClose: handleClose,
    onRestore: handleRestore,
    isLoading,
  });

  // Load offerings on mount
  useEffect(() => {
    loadOfferings();

    // Track paywall view
    AnalyticsEvents.paywallViewed(source);

    // Track paywall dismissal on unmount
    return () => {
      const duration = Math.floor((Date.now() - viewStartTime) / 1000);
      AnalyticsEvents.paywallDismissed(source, duration);
    };
  }, [loadOfferings, source, viewStartTime]);

  // Determine which cards to show based on mode
  const showYearlyCard = mode === 'full' || mode === 'yearly-only';
  const showMonthlyCard = mode === 'full' || mode === 'monthly-only';

  // Dynamic title based on mode
  const getTitle = () => {
    if (mode === 'yearly-only') return t('paywall.upgrade.yearlyTitle');
    if (mode === 'monthly-only') return t('paywall.upgrade.monthlyTitle');
    return t('paywall.hero.title');
  };

  const getSubtitle = () => {
    if (mode === 'yearly-only') return t('paywall.upgrade.yearlySubtitle');
    if (mode === 'monthly-only') return t('paywall.upgrade.monthlySubtitle');
    return t('paywall.hero.subtitle');
  };

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingBottom: insets.bottom }}
    >
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-5"
      >
        {/* Title Section */}
        <View className="pb-2 pt-4">
          <ProBadge />
          <Text className="mb-4 text-[2.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white">
            {getTitle()}
          </Text>
          <Text className="max-w-[300px] text-base font-normal leading-relaxed text-gray-500 dark:text-gray-400">
            {getSubtitle()}
          </Text>
        </View>

        {/* Features Section - Only show in full mode */}
        {mode === 'full' ? (
          <View className="py-6">
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
        ) : null}
      </ScrollView>

      {/* Pricing Section - Fixed at bottom */}
      <View className="gap-4 px-6 pb-4">
        {/* Yearly Card */}
        {showYearlyCard ? (
          <YearlyPricingCard
            title={t('paywall.plans.yearly.title')}
            price={formatPackagePrice(yearlyPackage)}
            period={t('paywall.plans.yearly.period')}
            originalPrice={yearlySavings.originalPrice}
            badge={t('paywall.plans.save', { percent: yearlySavings.savings })}
            hasTrial={mode === 'full'}
            trialText={t('paywall.plans.trial')}
            isSelected={selectedPlan === 'yearly'}
            onPress={() => handlePlanSelect('yearly')}
          />
        ) : null}

        {/* Monthly Card */}
        {showMonthlyCard ? (
          <MonthlyPricingCard
            title={t('paywall.plans.monthly.title')}
            price={formatPackagePrice(monthlyPackage)}
            period={t('paywall.plans.monthly.period')}
            subtitle={t('paywall.plans.monthly.subtitle')}
            isSelected={selectedPlan === 'monthly'}
            onPress={() => handlePlanSelect('monthly')}
          />
        ) : null}

        {/* CTA Button */}
        <Pressable
          onPress={handlePurchase}
          disabled={isLoading || !monthlyPackage || !yearlyPackage}
          accessibilityRole="button"
          className="mt-2 h-14 w-full items-center justify-center rounded-xl bg-primary-500 px-4 shadow-lg shadow-primary-500/20 active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-base font-bold uppercase tracking-wide text-white">
                {loadingState === 'purchasing'
                  ? t('paywall.cta.processing')
                  : t('paywall.cta.loading')}
              </Text>
            </View>
          ) : (
            <Text className="text-base font-bold uppercase tracking-wide text-white">
              {t('paywall.cta.trial')}
            </Text>
          )}
        </Pressable>

        {/* Error Message */}
        {error && !isLoading ? (
          <View className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <Text className="text-center text-sm text-red-600 dark:text-red-400">{error}</Text>
          </View>
        ) : null}

        {/* Loading Overlay for Offerings */}
        {isLoading && loadingState === 'loading' && !offerings ? (
          <View className="absolute inset-0 items-center justify-center bg-background-light/80 dark:bg-background-dark/80">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="text-text-muted-light dark:text-text-muted-dark mt-4 text-sm">
              {t('paywall.loading')}
            </Text>
          </View>
        ) : null}

        {/* Footer */}
        <PaywallFooter />
      </View>
    </View>
  );
}
